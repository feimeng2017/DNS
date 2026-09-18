var groupBaseOption = {
  "interval": 300,
  "timeout": 3000,
  "url": "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

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

var snifferConfig = {
  "enable": true,
  "sniff": {
    "HTTP": {
      "ports": [80, "8080-8880"],
      "override-destination": true
    },
    "TLS": {
      "ports": [443, 8443],
      "override-destination": true
    }
  },
  "skip-domain": [
    "Mijia Cloud",
    "+.push.apple.com"
  ]
};

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
    "+.market.xiaomi.com",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "time.*.com",
    "time.*.gov",
    "time.*.apple.com",
    "time1.cloud.tencent.com",
    "*.ntp.org.cn",
    "+.pool.ntp.org"
  ],
  "default-nameserver": [
    "223.5.5.5",
    "119.29.29.29",
    "2400:3200::1",
    "2402:4e00::"
  ],
  "direct-nameserver": [
    "223.5.5.5",
    "119.29.29.29",
    "2400:3200::1",
    "2402:4e00::"
  ],
  "nameserver": [
    "https://dns.cloudflare.com/dns-query",
    "https://dns.google/dns-query"
  ],
  "nameserver-policy": {
    "geosite:private": [
      "223.5.5.5",
      "119.29.29.29",
      "2400:3200::1",
      "2402:4e00::"
    ],
    "geosite:apple-cn": [
      "223.5.5.5",
      "119.29.29.29",
      "2400:3200::1",
      "2402:4e00::"
    ],
    "geosite:cn": [
      "223.5.5.5",
      "119.29.29.29",
      "2400:3200::1",
      "2402:4e00::"
    ]
  },
  "proxy-server-nameserver": [
    "223.5.5.5",
    "2400:3200::1",
    "https://doh.pub/dns-query",
    "https://dns.alidns.com/dns-query"
  ]
};

var tunConfig = {
  "enable": true,
  "stack": "mixed",
  "dns-hijack": ["any:53", "tcp://any:53"],
  "auto-route": true,
  "auto-redirect": false,
  "auto-detect-interface": true,
  "strict-route": true,
  "route-exclude-address": [
    "192.168.0.0/16",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "100.64.0.0/10",
    "169.254.0.0/16",
    "224.0.0.0/4",
    "fc00::/7",
    "fe80::/10",
    "ff00::/8"
  ],
  "exclude-interface": [
    "docker*",
    "podman*"
  ]
};

var rules = [
  "IP-CIDR,127.0.0.0/8,国内直连,no-resolve",
  "IP-CIDR,192.168.0.0/16,国内直连,no-resolve",
  "IP-CIDR,10.0.0.0/8,国内直连,no-resolve",
  "IP-CIDR,172.16.0.0/12,国内直连,no-resolve",
  "IP-CIDR,100.64.0.0/10,国内直连,no-resolve",
  "IP-CIDR,169.254.0.0/16,国内直连,no-resolve",
  "IP-CIDR,224.0.0.0/4,国内直连,no-resolve",
  "IP-CIDR6,::1/128,国内直连,no-resolve",
  "IP-CIDR6,fc00::/7,国内直连,no-resolve",
  "IP-CIDR6,fe80::/10,国内直连,no-resolve",
  "IP-CIDR6,ff00::/8,国内直连,no-resolve",
  "DOMAIN-SUFFIX,services.googleapis.cn,国外代理",
  "DOMAIN-SUFFIX,googleapis.cn,国外代理",
  "DOMAIN-SUFFIX,gvt1.com,国外代理",
  "DOMAIN-SUFFIX,gvt2.com,国外代理",
  "DOMAIN-SUFFIX,gvt3.com,国外代理",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,国外代理",
  "RULE-SET,Telegram,国外代理",
  "GEOSITE,apple-cn,国内直连",
  "GEOSITE,geolocation-!cn,国外代理",
  "GEOSITE,cn,国内直连",
  "GEOIP,CN,国内直连",
  "MATCH,国外代理"
];

function main(config) {
  var hasProxies = Boolean(config && config.proxies && Array.isArray(config.proxies) && config.proxies.length > 0);
  var hasProviders = Boolean(config && typeof config["proxy-providers"] === "object" && config["proxy-providers"] !== null && Object.keys(config["proxy-providers"]).length > 0);

  if (!hasProxies && !hasProviders) {
    throw new Error("配置文件中未找到任何代理节点或订阅源 (proxies / proxy-providers)");
  }

  var groupLoadBalance = mergeOptions(groupBaseOption, {
    "name": "国外负载均衡",
    "type": "load-balance",
    "strategy": "round-robin",
    "include-all": true,
    "exclude-filter": "官网|套餐|流量|异常|剩余",
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
  });

  var groupProxy = mergeOptions(groupBaseOption, {
    "name": "国外代理",
    "type": "select",
    "proxies": ["国外负载均衡"],
    "include-all": true,
    "exclude-filter": "官网|套餐|流量|异常|剩余",
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
  });

  var groupDirect = mergeOptions(groupBaseOption, {
    "name": "国内直连",
    "type": "select",
    "proxies": ["DIRECT", "国外代理"],
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
  });

  var proxyGroups = [groupProxy, groupLoadBalance, groupDirect];

  config["ipv6"] = true;
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;

  config["sniffer"] = snifferConfig;
  config["dns"] = dnsConfig;
  config["tun"] = tunConfig;
  config["proxy-groups"] = proxyGroups;
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat",
    "geosite": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    "mmdb": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb"
  };

  if (hasProxies) {
    for (var i = 0; i < config["proxies"].length; i++) {
      config["proxies"][i]["udp"] = true;
    }
  }

  return config;
}
