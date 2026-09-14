// Domestic DNS / 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query",
  "https://doh.pub/dns-query"
];

// Foreign DNS / 国外DNS服务器（指定走“国外代理”节点出站）
const foreignNameservers = [
  "https://1.1.1.1/dns-query#国外代理",
  "https://8.8.8.8/dns-query#国外代理"
];

// DNS Configuration / DNS参数配置
const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",

  // 本地 Fake-IP 模式关闭 IPv6 DNS 解析，避免 Chrome ULA 拦截；
  // 你的双栈 VPS 会在远端自动以 IPv6 访问目标外网
  "ipv6": false,

  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "+.lan",
    "+.local",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "localhost.work.weixin.qq.com",
    "+.in-addr.arpa",
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "pool.ntp.org"
  ],

  "default-nameserver": ["223.5.5.5", "119.29.29.29"],
  "nameserver": [...foreignNameservers],
  "proxy-server-nameserver": [...domesticNameservers],
  "direct-nameserver": [...domesticNameservers],
  "direct-nameserver-follow-policy": true,

  // 仅国内域名、内网以及【苹果中国区专属服务】走国内 DNS 解析
  "nameserver-policy": {
    "geosite:apple-cn,cn,private": domesticNameservers
  }
};

// 域名嗅探（防止裸 IP 直连漏油）
const snifferConfig = {
  "enable": true,
  "force-dns-mapping": true,
  "parse-pure-ip": true,
  "override-destination": false,
  "sniff": {
    "HTTP": { "ports": [80, "8080-8880"], "override-destination": true },
    "TLS": { "ports": [443, 8443] },
    "QUIC": { "ports": [443, 8443] }
  },
  "skip-domain": ["+.apple.com", "Mijia Cloud", "dlg.io.mi.com"]
};

// 规则集配置
const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 86400
};

const ruleProviders = {
  "Telegram": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram_No_Resolve.yaml",
    "path": "./ruleset/blackmatrix7/Telegram.yaml"
  },
  "AllProxy": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Global/Global_Domain.yaml",
    "path": "./ruleset/blackmatrix7/AllProxy.yaml"
  }
};

// 路由规则（从上到下匹配）
const rules = [
  "DOMAIN-SUFFIX,xiuxitong.com,国内直连",

  // TikTok 分流
  "DOMAIN-KEYWORD,tiktok,国外代理",
  "DOMAIN-KEYWORD,byteoversea,国外代理",
  "DOMAIN-SUFFIX,ibytedtos.com,国外代理",
  "DOMAIN-SUFFIX,ipstatp.com,国外代理",
  "DOMAIN-SUFFIX,muscdn.com,国外代理",
  "DOMAIN-SUFFIX,musical.ly,国外代理",
  "GEOSITE,tiktok,国外代理",

  // Telegram
  "RULE-SET,Telegram,国外代理",

  // 【苹果双商店精细化分流】
  // 1. 明确的国区服务（云上贵州 iCloud、国内官网与 CDN）强制直连，低延迟满速
  "GEOSITE,apple-cn,国内直连",
  // 2. 其余所有苹果全球服务（美区 App Store、Apple TV+ 等）走苹果专属策略组
  "GEOSITE,apple,苹果服务",

  // 私有网段直连
  "GEOSITE,private,国内直连",
  "GEOIP,private,国内直连,no-resolve",

  // 常见国外规则集
  "RULE-SET,AllProxy,国外代理",

  // 国内直连判定（加 no-resolve 避免未命中外网域名首包延迟）
  "GEOSITE,CN,国内直连",
  "GEOIP,CN,国内直连,no-resolve",

  // 兜底全走国外代理
  "MATCH,国外代理"
];

const groupBaseOption = {
  "interval": 300,
  "timeout": 5000,
  "url": "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object"
      ? Object.keys(config["proxy-providers"]).length
      : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  config["sniffer"] = snifferConfig;
  config["dns"] = dnsConfig;

  // 策略组定义
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "国外代理",
      "type": "select",
      // 优先提供【国外负载均衡】，同时也把单个节点列出供手动指定
      "proxies": ["国外负载均衡"],
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },

    {
      ...groupBaseOption,
      "name": "国外负载均衡",
      "type": "load-balance",
      // 【关键优化】：保留负载均衡，采用一致性哈希（consistent-hashing），防止跳 IP 导致封号/掉登录
      "strategy": "consistent-hashing",
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },

    {
      ...groupBaseOption,
      "name": "苹果服务",
      "type": "select",
      // 默认国外代理（保证美区商店畅通）；备用 DIRECT（大软件下载时可临时切直连提速）
      "proxies": ["国外代理", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
    },

    {
      ...groupBaseOption,
      "name": "国内直连",
      "type": "select",
      "proxies": ["DIRECT", "国外代理"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
    }
  ];

  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  if (config["proxies"]) {
    config["proxies"].forEach(proxy => {
      proxy.udp = true;
    });
  }

  return config;
}
