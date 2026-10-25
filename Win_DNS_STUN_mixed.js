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

  // ================= 1. Windows 进程白名单（特权直连） =================
  // 包含主流通讯、会议、语音开黑、远程P2P及游戏客户端
  "PROCESS-NAME,WeChat.exe,国内直连",
  "PROCESS-NAME,WeChatApp.exe,国内直连",
  "PROCESS-NAME,WeChatAppEx.exe,国内直连",
  "PROCESS-NAME,QQ.exe,国内直连",
  "PROCESS-NAME,TIM.exe,国内直连",
  "PROCESS-NAME,WXWork.exe,国内直连",          // 企业微信
  "PROCESS-NAME,wemeetapp.exe,国内直连",       // 腾讯会议
  "PROCESS-NAME,wemeet_room.exe,国内直连",     // 腾讯会议分室
  "PROCESS-NAME,DingTalk.exe,国内直连",        // 钉钉
  "PROCESS-NAME,Feishu.exe,国内直连",          // 飞书
  "PROCESS-NAME,KOOK.exe,国内直连",            // 开黑啦语音
  "PROCESS-NAME,YY.exe,国内直连",              // YY语音
  "PROCESS-NAME,ToDesk.exe,国内直连",          // ToDesk远程桌面
  "PROCESS-NAME,SunloginClient.exe,国内直连",  // 向日葵远程控制
  "PROCESS-NAME,WeGame.exe,国内直连",
  "PROCESS-NAME,WeGameLauncher.exe,国内直连",
  "PROCESS-NAME,Steam.exe,国内直连",
  "PROCESS-NAME,Battle.net.exe,国内直连",      // 暴雪战网
  "PROCESS-NAME,RiotClientServices.exe,国内直连", // 拳头对战服务
  "PROCESS-NAME,League of Legends.exe,国内直连", // 英雄联盟
  "PROCESS-NAME,Crossfire.exe,国内直连",        // 穿越火线
  "PROCESS-NAME,YuanShen.exe,国内直连",         // 原神
  "PROCESS-NAME,GenshinImpact.exe,国内直连",
  "PROCESS-NAME,StarRail.exe,国内直连",         // 星穹铁道
  "PROCESS-NAME,ZenlessZoneZero.exe,国内直连",  // 绝区零
  "PROCESS-NAME,Naraka.exe,国内直连",           // 永劫无间
  "PROCESS-NAME,heroes.exe,国内直连",           // 洛奇英雄传 (主对局/P2P房主进程)
  "PROCESS-NAME,HeroesLauncher.exe,国内直连",   // 洛奇英雄传 (登录更新器)
  "PROCESS-NAME,vindictus.exe,国内直连",        // 洛奇英雄传 (国际服/备用程序名)
  "PROCESS-NAME,imFile.exe,国内直连",          // imFile 下载管理器 (解决 BT/磁力 uTP 满速直连)
  "PROCESS-NAME,imfile.exe,国内直连",

  // ================= 2. STUN / WebRTC 捕获网 =================
  // STUN/TURN 捕获：优先强制走支持 UDP 的国外代理 (category-stun + 域名关键词兜底 + 常见端口)
  "GEOSITE,category-stun,国外代理",
  "DOMAIN-KEYWORD,stun,国外代理",
  "DST-PORT,3478,国外代理",
  "DST-PORT,5349,国外代理",
  "DST-PORT,19302-19309,国外代理",

  // ================= 3. 非白名单全域 UDP 阻断降级网 =================
  // ① 阻断全部非白名单程序的 IPv6 UDP (全端口阻断，防 IPv6 WebRTC 泄露；保留 IPv6 TCP 业务)
  "AND,((NETWORK,udp),(IP-CIDR6,::/0,no-resolve)),REJECT",

  // ② 域名层 + 目标IP层 双重 REJECT（阻断国内非标 UDP，促使 HTTP/3 快速降级为 TCP 直连）
  "AND,((NETWORK,udp),(GEOSITE,cn)),REJECT",
  "AND,((NETWORK,udp),(GEOIP,CN)),REJECT",

  // ================= 4. 下载与常规分流 =================
  // 授权下载规则集走国内直连（后置于 UDP 拦截网：遵循最小权限，白名单外的下载流量受 UDP 防护）
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
