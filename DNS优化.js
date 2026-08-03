// Domestic DNS / 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // Alibaba DoH / 阿里DoH
  "https://doh.pub/dns-query"     // Tencent DoH / 腾讯DoH
];

// Foreign DNS / 国外DNS服务器
const foreignNameservers = [
  "https://1.1.1.1/dns-query",     // Cloudflare DNS / Cloudflare DoH
  "https://8.8.4.4/dns-query",     // Google DNS / Google DoH
  "https://208.67.222.222/dns-query" // OpenDNS / OpenDNS DoH
];

// DNS Configuration / DNS参数配置
const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",
  "ipv6": false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    // Local host & devices / 本地主机与设备
    "+.lan",
    "+.local",
    // Windows Network Connectivity Status Indicator / Windows网络连接测试
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    // QQ & WeChat Login Detection / QQ与微信快速登录检测
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "localhost.work.weixin.qq.com",
    // Google Play Store Download Fix / 谷歌商店下载修复（防止Fake-IP干扰下载）
    "+.googleapis.cn",
    "+.xn--ngstr-lra8j.com",
    "+.gvt1.com",
    "+.gvt2.com",
    // NTP & IP Reverse Lookup / 时间同步与IP反向解析
    "+.in-addr.arpa", 
    "+.ip6.arpa",
    "time.*.com",
    "time.*.gov",
    "pool.ntp.org"
  ],
  "default-nameserver": ["223.5.5.5", "1.2.4.8"],
  "nameserver": [...foreignNameservers],
  "proxy-server-nameserver": [...domesticNameservers],
  "direct-nameserver": [...domesticNameservers],
  "nameserver-policy": {
    "geosite:private,cn": domesticNameservers
  }
};

// Rule Provider Common Options / 规则集通用配置
const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 86400
};

// Rule Providers / 规则集源配置
const ruleProviders = {
  "google": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
    "path": "./ruleset/loyalsoldier/google.yaml"
  },
  "proxy": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    "path": "./ruleset/loyalsoldier/proxy.yaml"
  },
  "direct": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    "path": "./ruleset/loyalsoldier/direct.yaml"
  },
  "private": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    "path": "./ruleset/loyalsoldier/private.yaml"
  },
  "gfw": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    "path": "./ruleset/loyalsoldier/gfw.yaml"
  },
  "tld-not-cn": {
    ...ruleProviderCommon,
    "behavior": "domain",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    "path": "./ruleset/loyalsoldier/tld-not-cn.yaml"
  },
  "telegramcidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    "path": "./ruleset/loyalsoldier/telegramcidr.yaml"
  },
  "cncidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    "path": "./ruleset/loyalsoldier/cncidr.yaml"
  },
  "lancidr": {
    ...ruleProviderCommon,
    "behavior": "ipcidr",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    "path": "./ruleset/loyalsoldier/lancidr.yaml"
  },
  "applications": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
    "path": "./ruleset/loyalsoldier/applications.yaml"
  },
  "TikTok": {
    ...ruleProviderCommon,
    "behavior": "classical",
    "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/TikTok.txt",
    "path": "./ruleset/xiaolin-007/TikTok.yaml"
  }
};



// Routing Rules / 路由规则
const rules = [
  // 特殊网站 国外地址 需要中国IP访问
  "DOMAIN-SUFFIX,xiuxitong.com,国内直连",




  


  // ByteDance Overseas & TikTok Custom Rules / 优先匹配字节跳动海外及TikTok域名
  "DOMAIN-KEYWORD,tiktok,国外代理",
  "DOMAIN-KEYWORD,byteoversea,国外代理",
  "DOMAIN-SUFFIX,ibytedtos.com,国外代理",
  "DOMAIN-SUFFIX,ipstatp.com,国外代理",
  "DOMAIN-SUFFIX,muscdn.com,国外代理",
  "DOMAIN-SUFFIX,musical.ly,国外代理",
  "RULE-SET,TikTok,国外代理",

  // Custom Google Play Rules / 自定义 Google Play 与 Google 服务规则
  "DOMAIN-SUFFIX,googleapis.cn,国外代理",
  "DOMAIN-SUFFIX,gstatic.com,国外代理",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,国外代理",
  "DOMAIN-SUFFIX,gvt1.com,国外代理",
  "DOMAIN-SUFFIX,gvt2.com,国外代理",
  "DOMAIN-SUFFIX,github.io,国外代理",

  // Loyalsoldier Rulesets / 规则集分流
  "RULE-SET,applications,国内直连",
  "RULE-SET,private,国内直连",
  "RULE-SET,google,国外代理",
  "RULE-SET,proxy,国外代理",
  "RULE-SET,gfw,国外代理",
  "RULE-SET,tld-not-cn,国外代理",
  "RULE-SET,direct,国内直连",
  "RULE-SET,lancidr,国内直连,no-resolve",
  "RULE-SET,cncidr,国内直连,no-resolve",
  "RULE-SET,telegramcidr,国外代理,no-resolve",

  // GeoIP & GeoSite / 地理位置分流
  "GEOSITE,CN,国内直连",
  "GEOIP,LAN,国内直连,no-resolve",
  "GEOIP,CN,国内直连,no-resolve",

  // Match Unrouted Traffic / 漏网之鱼（未命中规则全部走国外代理）
  "MATCH,国外代理"
];

// Base Option for Proxy Groups / 代理组通用选项配置
const groupBaseOption = {
  "interval": 300,
  "timeout": 3000,
  "url": "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// Main Entry Function / 程序主入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // Override DNS Settings / 覆盖原配置中的 DNS 设置
  config["dns"] = dnsConfig;

  // Override Proxy Groups / 覆盖原配置中的代理组
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "国外代理",
      "type": "select",
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

  // Override Rule Providers and Rules / 覆盖规则集和路由规则
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  // Force UDP Enable on Proxies / 强制为每个节点开启 UDP 功能
  if (config["proxies"]) {
    config["proxies"].forEach(proxy => {
      proxy.udp = true;
    });
  }

  return config;
}
