var selectBaseOption = {
  "hidden": false
};

var loadBalanceBaseOption = {
  "interval": 120,
  "timeout": 5000,
  "url": "https://www.google.com/generate_204",
  "expected-status": 204,
  "lazy": true,
  "max-failed-times": 2,
  "hidden": false
};

// 专用下载器进程白名单（仅匹配下载软件自身进程，不拦截浏览器网页；喜欢尝鲜新下载器时在此增删进程名即可）
var directDownloaderProcesses = [
  // --- Windows 下载器 / BT / 网盘客户端 ---
  "imFile.exe",
  "IDMan.exe",               // Internet Download Manager
  "Motrix.exe",              // Motrix
  "gopeed.exe",              // Gopeed
  "ABDownloadManager.exe",   // AB Download Manager
  "NeatDM.exe",              // Neat Download Manager
  "XDown.exe",               // XDown
  "fdm.exe",                 // Free Download Manager
  "aria2c.exe",              // Aria2
  "qbittorrent.exe",         // qBittorrent
  "qbittorrent-nox.exe",
  "BitComet.exe",            // 比特彗星
  "BitComet_x64.exe",
  "Transmission.exe",
  "uTorrent.exe",
  "WebTorrent.exe",
  "Tixati.exe",
  "Deluge.exe",
  "BiglyBT.exe",
  "Folx.exe",
  "Thunder.exe",             // 迅雷
  "NetTransport.exe",
  "DownloadService.exe",
  "baidunetdisk.exe",        // 百度网盘
  "Weiyun.exe",              // 微云
  "aDrive.exe",              // 阿里云盘
  "quarkpan.exe",            // 夸克网盘
  "115.exe",                 // 115 网盘
  "CloudDrive.exe",
  // --- macOS / Linux 同名无后缀兼容 ---
  "imFile", "Motrix", "gopeed", "fdm", "aria2c", "qbittorrent",
  "BitComet", "Transmission", "uTorrent", "WebTorrent", "Folx", "Thunder",
  // --- Android 下载器 / BT / 网盘包名 ---
  "com.xunlei.downloadprovider",        // 手机迅雷
  "com.baidu.netdisk",                  // 百度网盘
  "com.dv.adm",                         // ADM
  "com.dv.adm.pay",
  "idm.internet.download.manager",      // 1DM
  "idm.internet.download.manager.plus", // 1DM+
  "com.gopeed",                         // Gopeed
  "org.proninyaroslav.libretorrent",    // LibreTorrent
  "com.utorrent.client",
  "com.bittorrent.client"
];

// 浏览器防 WebRTC 裸 IP / 非标端口兜底进程列表（Windows + Android；iOS 由上方 STUN 层与系统环境处理）
var browserAntiLeakProcesses = [
  "msedge.exe",
  "msedgewebview2.exe",
  "chrome.exe",
  "firefox.exe",
  "brave.exe",
  "com.microsoft.emmx",
  "com.android.chrome",
  "org.mozilla.firefox",
  "com.brave.browser"
];

function buildProcessRules(list, target) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push("PROCESS-NAME," + list[i] + "," + target);
  }
  return out;
}

function buildBrowserUdpAntiLeakRules(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    out.push("AND,((PROCESS-NAME," + list[i] + "),(NETWORK,udp)),国外代理");
    out.push("AND,((PROCESS-NAME," + list[i] + "),(NETWORK,udp)),REJECT");
  }
  return out;
}

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
    "proxy": "国外代理",
    "url": "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram_No_Resolve.yaml",
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
  "direct-nameserver-follow-policy": true,
  "use-hosts": true,
  "use-system-hosts": false,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-range6": "2001:2::1/64",
  "fake-ip-filter-mode": "blacklist",
  "fake-ip-filter": [
    "geosite:private",
    "+.lan",
    "+.local",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
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
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query"
  ],
  "nameserver": [
    "https://cloudflare-dns.com/dns-query",
    "https://dns.google/dns-query"
  ],
  "nameserver-policy": {
    "geosite:private": [
      "system"
    ],
    "+.googleapis.cn": [
      "https://cloudflare-dns.com/dns-query#国外代理",
      "https://dns.google/dns-query#国外代理"
    ],
    "geosite:apple-cn": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],
    "geosite:cn": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ]
  },
  "proxy-server-nameserver": [
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query"
  ]
};

var tunConfig = {
  "enable": true,
  "stack": "mips",
  "inet6-address": ["2001:2::1/126"],
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

var rules = [].concat(
  [
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
    "DOMAIN-SUFFIX,googleapis.cn,国外代理",
    "DOMAIN-SUFFIX,gvt1.com,国外代理",
    "DOMAIN-SUFFIX,gvt2.com,国外代理",
    "DOMAIN-SUFFIX,gvt3.com,国外代理",
    "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,国外代理"
  ],

  // ================= 1. 进程与应用特权补丁层（下载器直连、P2P 游戏与实时通讯） =================
  // 1a. 专用下载器进程直连（不干扰浏览器网页下载的国内外分流判断）
  buildProcessRules(directDownloaderProcesses, "国内直连"),

  [
    // 1b. P2P 游戏与桌面/移动端核心实时通讯（保障语音/视频/对局 STUN 与媒体流统一走国内直连，已剔除浏览器网页子进程）
    "PROCESS-NAME,heroes.exe,国内直连",          // 洛奇英雄传 (核心对局/动态 P2P 房主 UDP 直连)
    "PROCESS-NAME,Weixin.exe,国内直连",          // 微信 4.0+ 新架构主进程
    "PROCESS-NAME,WeChat.exe,国内直连",          // 微信 3.x 旧版及国际版桌面进程
    "PROCESS-NAME,QQ.exe,国内直连",
    "PROCESS-NAME,WXWork.exe,国内直连",          // 企业微信
    "PROCESS-NAME,wemeetapp.exe,国内直连",       // 腾讯会议
    "PROCESS-NAME,wemeet_room.exe,国内直连",     // 腾讯会议分室
    "PROCESS-NAME,com.tencent.mm,国内直连",      // Android 微信 / WeChat (Google Play)
    "PROCESS-NAME,com.tencent.mobileqq,国内直连",// Android QQ
    "PROCESS-NAME,com.tencent.wework,国内直连",  // Android 企业微信
    "PROCESS-NAME,com.tencent.wemeet.app,国内直连", // Android 腾讯会议

    // ================= 2. STUN / TURN 高优先级捕获层（附 UDP REJECT 防穿透兜底） =================
    // 捕获浏览器及非特权应用的 STUN/TURN 探测；若手动切换为不支持 UDP 的单节点，相邻 REJECT 阻断 UDP 防止向下穿透泄露
    "GEOSITE,category-stun,国外代理",
    "AND,((NETWORK,udp),(GEOSITE,category-stun)),REJECT",
    "DOMAIN-KEYWORD,stun,国外代理",
    "AND,((NETWORK,udp),(DOMAIN-KEYWORD,stun)),REJECT",
    "DST-PORT,3478,国外代理",
    "AND,((NETWORK,udp),(DST-PORT,3478)),REJECT",
    "DST-PORT,5349,国外代理",
    "AND,((NETWORK,udp),(DST-PORT,5349)),REJECT",
    "DST-PORT,19302-19309,国外代理",
    "AND,((NETWORK,udp),(DST-PORT,19302-19309)),REJECT",

    // ================= 3. 已知国内域名 UDP 443/8443 抑制（零 DNS 解析） =================
    // 优先将国内网站 HTTP/3 退回高速 TCP 直连；浏览器不会绕道 VPS
    "AND,((NETWORK,udp),(DST-PORT,443),(GEOSITE,cn)),REJECT",
    "AND,((NETWORK,udp),(DST-PORT,8443),(GEOSITE,cn)),REJECT",

    // ================= 4. 海外域名与规则集优先分流（浏览器下载海外资源直接走此层） =================
    "RULE-SET,Telegram,国外代理",
    "GEOSITE,geolocation-!cn,国外代理",

    // ================= 5. 未知域名/纯 IP 的国内 UDP 443/8443 抑制 =================
    // 置于 geolocation-!cn 之后：消除海外 QUIC 的同步 DNS 阻塞，同时阻断未收录国内 CDN 站点的 HTTP/3 及 443/8443 裸 IP STUN
    "AND,((NETWORK,udp),(DST-PORT,443),(GEOIP,CN)),REJECT",
    "AND,((NETWORK,udp),(DST-PORT,8443),(GEOIP,CN)),REJECT"
  ],

  // ================= 6. 浏览器非标 UDP 防 WebRTC 裸 IP 泄露兜底 =================
  // 后置于上方国内 HTTP/3 抑制规则（国内网页已退回 TCP 直连，不绕 VPS），前置于 GEOSITE,cn / GEOIP,CN；
  // 拦截网页硬编码大陆 IP + 非标端口（如 UDP 50000）或冷门国内域名 WebRTC 探测
  buildBrowserUdpAntiLeakRules(browserAntiLeakProcesses),

  [
    // ================= 7. 国内常规域名与 IP 直连（浏览器下载国内资源走此层） =================
    "GEOSITE,apple-cn,国内直连",
    "GEOSITE,cn,国内直连",
    "GEOIP,CN,国内直连",

    // ================= 8. 最终兜底出站 =================
    "MATCH,国外代理"
  ]
);

function main(config) {
  var hasProxies = Boolean(config && config.proxies && Array.isArray(config.proxies) && config.proxies.length > 0);
  var hasProviders = Boolean(config && typeof config["proxy-providers"] === "object" && config["proxy-providers"] !== null && Object.keys(config["proxy-providers"]).length > 0);

  if (!hasProxies && !hasProviders) {
    throw new Error("配置文件中未找到任何代理节点或订阅源 (proxies / proxy-providers)");
  }

  // 兜底补齐 1：仅在常规 proxies 节点未显式配置 udp 字段时默认开启 UDP；尊重已明确声明 udp: false 的节点
  if (hasProxies) {
    for (var j = 0; j < config.proxies.length; j++) {
      var proxy = config.proxies[j];
      if (proxy && typeof proxy === "object" && typeof proxy.udp === "undefined") {
        proxy.udp = true;
      }
    }
  }

  // 兜底补齐 2：仅在 proxy-providers 的 override 未显式设置 udp 时补齐开启；尊重已明确声明 udp: false 的订阅
  if (hasProviders) {
    var providers = config["proxy-providers"];
    var providerKeys = Object.keys(providers);
    for (var i = 0; i < providerKeys.length; i++) {
      var pName = providerKeys[i];
      var provider = providers[pName];
      if (provider && typeof provider === "object") {
        var existingOverride = (provider.override && typeof provider.override === "object") ? provider.override : {};
        if (typeof existingOverride.udp === "undefined") {
          provider.override = mergeOptions(existingOverride, { "udp": true });
        }
      }
    }
  }

  var groupLoadBalance = mergeOptions(loadBalanceBaseOption, {
    "name": "国外负载均衡",
    "type": "load-balance",
    "strategy": "round-robin",
    "include-all": true,
    "exclude-filter": "官网|套餐|流量|异常|剩余",
    "empty-fallback": "REJECT",
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
  });

  var groupProxy = mergeOptions(selectBaseOption, {
    "name": "国外代理",
    "type": "select",
    "proxies": ["国外负载均衡"],
    "include-all": true,
    "exclude-filter": "官网|套餐|流量|异常|剩余",
    "empty-fallback": "REJECT",
    "url": "https://www.google.com/generate_204",
    "timeout": 3000,
    "expected-status": 204,
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
  });

  var groupDirect = mergeOptions(selectBaseOption, {
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
  config["geo-auto-update"] = true;
  config["geo-update-interval"] = 720; // 720 小时 (30 天)
  config["geox-url"] = {
    "geoip": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat",
    "geosite": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    "mmdb": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb",
    "asn": "https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"
  };

  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true
  };

  return config;
}
