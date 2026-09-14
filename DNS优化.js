// 基础参数配置
var groupBaseOption = {
  "interval": 300,
  "timeout": 3000,
  "url": "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// 辅助对象合并函数（兼容各类 JS 运行环境）
function mergeOptions(base, extra) {
  var result = {};
  var key;
  for (key in base) {
    if (Object.prototype.hasOwnProperty.call(base, key)) {
      result[key] = base[key];
    }
  }
  for (key in extra) {
    if (Object.prototype.hasOwnProperty.call(extra, key)) {
      result[key] = extra[key];
    }
  }
  return result;
}

// 保留专用的 Telegram 规则集
var ruleProviders = {
  "Telegram": {
    "type": "http",
    "format": "yaml",
    "interval": 86400,
    "behavior": "classical",
    "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram_No_Resolve.yaml",
    "path": "./ruleset/blackmatrix7/Telegram.yaml"
  }
};

// 老李的 DNS 配置（开启 IPv6 完全体）
var dnsConfig = {
  "enable": true,
  "ipv6": true,
  "cache-algorithm": "arc",
  "respect-rules": true,
  "use-hosts": true,
  "use-system-hosts": false,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.0/16",
  "fake-ip-filter-mode": "blacklist",
  "fake-ip-filter": [
    "+.lan",
    "+.local",
    "+.market.xiaomi.com"
  ],
  "default-nameserver": [
    "223.5.5.5",
    "119.29.29.29"
  ],
  "nameserver": [
    "https://dns.cloudflare.com/dns-query",
    "https://dns.google/dns-query"
  ],
  "nameserver-policy": {
    "geosite:private,apple-cn,cn": [
      "223.5.5.5",
      "119.29.29.29"
    ]
  },
  "proxy-server-nameserver": [
    "https://223.5.5.5/dns-query",
    "https://120.53.53.53/dns-query"
  ]
};

// 老李的 TUN 配置（开启 IPv6 完全体及严格路由防泄漏）
var tunConfig = {
  "enable": true,
  "stack": "mixed",
  "dns-hijack": ["any:53", "tcp://any:53"],
  "auto-route": true,
  "auto-redirect": true,
  "auto-detect-interface": true,
  "strict-route": true,
  "route-exclude-address": [
    "192.168.0.0/16",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "fc00::/7",
    "fe80::/10"
  ],
  "exclude-interface": [
    "docker*",
    "podman*"
  ]
};

// 整合后的路由规则（Telegram 走代理，Apple 国区直连、外区代理，GEOIP 极简直连）
var rules = [
  // 局域网与私有 IP 直连
  "IP-CIDR,127.0.0.0/8,国内直连,no-resolve",
  "IP-CIDR,192.168.0.0/16,国内直连,no-resolve",
  "IP-CIDR,10.0.0.0/8,国内直连,no-resolve",
  "IP-CIDR,172.16.0.0/12,国内直连,no-resolve",
  "IP-CIDR6,::1/128,国内直连,no-resolve",
  "IP-CIDR6,fc00::/7,国内直连,no-resolve",
  "IP-CIDR6,fe80::/10,国内直连,no-resolve",

  // Telegram 专属代理
  "RULE-SET,Telegram,国外代理",

  // 苹果精细化分流：apple-cn 走直连，美区商店自动滑向后面的国外代理
  "GEOSITE,apple-cn,国内直连",

  // 国内 IP 归属地直连（不加 no-resolve 确保域名解析判断准确）
  "GEOIP,CN,国内直连",

  // 兜底全走国外代理（涵盖美区 Apple、TikTok 及所有外网服务）
  "MATCH,国外代理"
];

// 你的代理组配置
var proxyGroups = [
  mergeOptions(groupBaseOption, {
    "name": "国外代理",
    "type": "select",
    "proxies": ["国外负载均衡"],
    "include-all": true,
    "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
  }),
  mergeOptions(groupBaseOption, {
    "name": "国外负载均衡",
    "type": "load-balance",
    "strategy": "round-robin",
    "include-all": true,
    "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
  }),
  mergeOptions(groupBaseOption, {
    "name": "国内直连",
    "type": "select",
    "proxies": ["DIRECT", "国外代理"],
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
  })
];

// 主入口函数
function main(config) {
  var proxyCount = (config && config.proxies) ? config.proxies.length : 0;
  var proxyProviderCount =
    (config && typeof config["proxy-providers"] === "object" && config["proxy-providers"] !== null)
      ? Object.keys(config["proxy-providers"]).length
      : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 基础参数与全局 IPv6 开关
  config["ipv6"] = true;
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;

  // 写入配置模块
  config["dns"] = dnsConfig;
  config["tun"] = tunConfig;
  config["proxy-groups"] = proxyGroups;
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  // GeoData 资源镜像更新源
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.metadb",
    "geosite": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    "mmdb": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb"
  };

  // 开启所有节点的 UDP 支持
  if (config["proxies"] && Array.isArray(config["proxies"])) {
    for (var i = 0; i < config["proxies"].length; i++) {
      config["proxies"][i]["udp"] = true;
    }
  }

  return config;
}
