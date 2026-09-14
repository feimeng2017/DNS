// Domestic DNS / 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query",
  "https://doh.pub/dns-query"
];

// Foreign DNS / 国外DNS服务器
// 通过 #RULES 按路由规则建立 DNS 连接；proxy-server-nameserver
// 用国内 DNS 专门解决代理节点域名，避免 DNS 代理的“鸡生蛋”问题。
const foreignNameservers = [
  "https://1.1.1.1/dns-query#RULES",
  "https://8.8.8.8/dns-query#RULES"
];

// DNS Configuration / DNS参数配置
const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",

  // 本地网络有 IPv6 时允许解析 AAAA；没有 IPv6 时由系统/网络栈自动走 IPv4。
  "ipv6": true,

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
    "+.xn--ngstr-lra8j.com",
    "+.gvt1.com",
    "+.gvt2.com",
    "+.in-addr.arpa",
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "pool.ntp.org"
  ],

  // 只负责解析 DNS 服务器自身地址；必须使用 IP/可直接访问的地址。
  "default-nameserver": ["223.5.5.5", "119.29.29.29"],

  // 普通/国外域名默认使用境外 DoH，并按路由规则建立 DoH 连接。
  "nameserver": [...foreignNameservers],

  // 代理节点域名使用国内 DNS，避免代理 DNS 自身形成循环依赖。
  "proxy-server-nameserver": [...domesticNameservers],

  // DIRECT 出口域名使用国内 DNS；同时遵循 nameserver-policy。
  "direct-nameserver": [...domesticNameservers],
  "direct-nameserver-follow-policy": true,

  // 中国、内网、Apple 域名直接使用国内 DNS。
  "nameserver-policy": {
    "geosite:cn,private,apple": domesticNameservers
  }
};

// Rule Provider Common Options
const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 86400
};

// Rule Providers
const ruleProviders = {
  "Telegram": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram_No_Resolve.yaml",
    "path": "./ruleset/blackmatrix7/Telegram.yaml"
  },

  "Apple": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://cdn.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Apple.yaml",
    "path": "./ruleset/acl4ssr/Apple.yaml"
  },

  "AllProxy": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Global/Global_Domain.yaml",
    "path": "./ruleset/blackmatrix7/AllProxy.yaml"
  },

  "TikTok": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/TikTok.txt",
    "path": "./ruleset/xiaolin-007/TikTok.yaml"
  }
};

// Routing Rules
// 规则按“从上到下、首次命中即停止”执行。
const rules = [
  "DOMAIN-SUFFIX,xiuxitong.com,国内直连",

  // 明确需要代理的国外服务优先于 CN/GeoIP 规则。
  "DOMAIN-KEYWORD,tiktok,国外代理",
  "DOMAIN-KEYWORD,byteoversea,国外代理",
  "DOMAIN-SUFFIX,ibytedtos.com,国外代理",
  "DOMAIN-SUFFIX,ipstatp.com,国外代理",
  "DOMAIN-SUFFIX,muscdn.com,国外代理",
  "DOMAIN-SUFFIX,musical.ly,国外代理",
  "RULE-SET,TikTok,国外代理",

  "DOMAIN-SUFFIX,gstatic.com,国外代理",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,国外代理",
  "DOMAIN-SUFFIX,gvt1.com,国外代理",
  "DOMAIN-SUFFIX,gvt2.com,国外代理",
  "DOMAIN-SUFFIX,github.io,国外代理",

  // 私有地址优先直连；GEOIP private 不需要再次解析域名。
  "GEOSITE,private,国内直连",
  "GEOIP,private,国内直连,no-resolve",

  // Telegram / Apple 明确规则优先于通用国外规则。
  "RULE-SET,Telegram,国外代理",
  "RULE-SET,Apple,国内直连",

  // 通用国外域名规则放在 CN 规则之前，避免被后面的 GEOSITE,CN 抢先命中。
  "RULE-SET,AllProxy,国外代理",

  // 中国域名/IP 直连。
  "GEOSITE,CN,国内直连",
  "GEOIP,CN,国内直连",

  // 其余流量全部代理。
  "MATCH,国外代理"
];

// Base Option for Proxy Groups
const groupBaseOption = {
  "interval": 300,
  "timeout": 5000,
  "url": "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 5,
  "hidden": false
};

// Main Entry Function
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;

  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object"
      ? Object.keys(config["proxy-providers"]).length
      : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 开启 Mihomo 全局 IPv6 能力：
  // 有 IPv6 的网络可以使用；
  // 没有 IPv6 的网络仍可正常使用 IPv4。
  // 不在覆写层强制 ipv6-prefer。
  config["ipv6"] = true;

  config["dns"] = dnsConfig;

  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "国外代理",
      "type": "select",
      "proxies": ["国外负载均衡"],
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },

    {
      ...groupBaseOption,
      "name": "国外负载均衡",
      "type": "load-balance",
      "strategy": "round-robin",
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
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
