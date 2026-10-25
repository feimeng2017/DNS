var groupBaseOption = {
  "interval": 300,
  "timeout": 3000,
  "url": "https://www.google.com/generate_204",
  "expected-status": 204,
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
  },
  "Download": {
    "type": "http",
    "format": "yaml",
    "interval": 86400,
    "behavior": "classical",
    "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Download/Download.yaml",
    "path": "./ruleset/blackmatrix7/Download.yaml"
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
    },
    "QUIC": {
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
  "stack": "mips",
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
  ]
};

var rules = [
  // 局域网/私有地址硬 DIRECT：用于显式代理端口入站及规则兜底；
  // TUN route-exclude-address 另在 OS 路由层排除
  "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
  "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
  "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
  "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",
  "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
  "IP-CIDR6,::1/128,DIRECT,no-resolve",
  "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
  "IP-CIDR6,fe80::/10,DIRECT,no-resolve",
  "IP-CIDR6,ff00::/8,DIRECT,no-resolve",

  // 基础必要国外代理服务
  "DOMAIN-SUFFIX,services.googleapis.cn,国外代理",
  "DOMAIN-SUFFIX,googleapis.cn,国外代理",
  "DOMAIN-SUFFIX,gvt1.com,国外代理",
  "DOMAIN-SUFFIX,gvt2.com,国外代理",
  "DOMAIN-SUFFIX,gvt3.com,国外代理",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,国外代理",

  // ================= 1. STUN / TURN 高优先级捕获层 =================
  // 前置于应用/进程特权规则：已被 Geosite、域名关键词或常见 STUN/TURN 目标端口识别的连接优先经由国外代理，避免被特权规则提前导向国内直连
  "GEOSITE,category-stun,国外代理",
  "DOMAIN-KEYWORD,stun,国外代理",
  "DST-PORT,3478,国外代理",
  "DST-PORT,5349,国外代理",
  "DST-PORT,19302-19309,国外代理",

  // ================= 2. 进程与应用特权补丁层（特殊协议与核心实时通讯） =================
  // --- 关键 P2P / 原始生 IP 保护（目的地规则无法可靠覆盖的特权程序） ---
  "PROCESS-NAME,imFile.exe,国内直连",          // imFile 下载管理器 (防海量海外生 IP 涌入代理并保障 BT/uTP 满速)
  "PROCESS-NAME,imfile.exe,国内直连",
  "PROCESS-NAME,heroes.exe,国内直连",          // 洛奇英雄传 (核心对局/动态 P2P 房主 UDP 直连)

  // --- 桌面核心实时通讯观察组（保障语音/视频/会议 UDP 低延迟，已剔除浏览器网页子进程） ---
  "PROCESS-NAME,WeChat.exe,国内直连",
  "PROCESS-NAME,QQ.exe,国内直连",
  "PROCESS-NAME,WXWork.exe,国内直连",          // 企业微信
  "PROCESS-NAME,wemeetapp.exe,国内直连",       // 腾讯会议
  "PROCESS-NAME,wemeet_room.exe,国内直连",     // 腾讯会议分室

  // --- 移动端核心实时通讯观察组（Android 包名 PROCESS 规则；其他平台由下游目的地规则接管） ---
  "PROCESS-NAME,com.tencent.mm,国内直连",            // 微信
  "PROCESS-NAME,com.tencent.mobileqq,国内直连",      // QQ
  "PROCESS-NAME,com.tencent.wework,国内直连",        // 企业微信
  "PROCESS-NAME,com.tencent.wemeet.app,国内直连",    // 腾讯会议

  // ================= 3. 目标化 UDP 端口限制网 (三端公共基线) =================
  // 限制 CN 目标的 UDP/443 与 UDP/8443；主要用于抑制这些常见端口上的 UDP 流量，不能等价于 QUIC 协议识别
  // 💡 不做全量 IPv6 UDP 阻断与非标高端口封杀，保证手机各应用在双栈环境下的语音、对局与日常连接顺畅
  "AND,((NETWORK,udp),(DST-PORT,443),(GEOSITE,cn)),REJECT",
  "AND,((NETWORK,udp),(DST-PORT,8443),(GEOSITE,cn)),REJECT",
  "AND,((NETWORK,udp),(DST-PORT,443),(GEOIP,CN)),REJECT",
  "AND,((NETWORK,udp),(DST-PORT,8443),(GEOIP,CN)),REJECT",

  // ================= 4. 下载与常规分流 =================
  // 下载规则集走国内直连；后置于 CN UDP/443、8443 限制规则，避免 Download 规则提前覆盖该限制
  "RULE-SET,Download,国内直连",
  "RULE-SET,Telegram,国外代理",
  "GEOSITE,apple-cn,国内直连",
  "GEOSITE,geolocation-!cn,国外代理",
  "GEOSITE,cn,国内直连",
  "GEOIP,CN,国内直连",

  // ================= 5. 最终兜底出站 =================
  "MATCH,国外代理"
];

function main(config) {
  var hasProxies = Boolean(config && config.proxies && Array.isArray(config.proxies) && config.proxies.length > 0);
  var hasProviders = Boolean(config && typeof config["proxy-providers"] === "object" && config["proxy-providers"] !== null && Object.keys(config["proxy-providers"]).length > 0);

  if (!hasProxies && !hasProviders) {
    throw new Error("配置文件中未找到任何代理节点或订阅源 (proxies / proxy-providers)");
  }

  // 兜底补齐：在保留原 override 参数的前提下，确保自建订阅源节点开启 UDP 转发能力
  if (hasProviders) {
    var providers = config["proxy-providers"];
    var providerKeys = Object.keys(providers);
    for (var i = 0; i < providerKeys.length; i++) {
      var pName = providerKeys[i];
      var provider = providers[pName];
      if (provider && typeof provider === "object") {
        provider.override = mergeOptions(
          provider.override || {},
          { "udp": true }
        );
      }
    }
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
    "default-selected": "DIRECT",
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
  });

  var proxyGroups = [groupProxy, groupLoadBalance, groupDirect];

  config["ipv6"] = true;
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["find-process-mode"] = "strict";

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

  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true
  };

  return config;
}
