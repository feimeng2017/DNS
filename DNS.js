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
  },
  "Download": {
    "type": "http",
    "format": "yaml",
    "interval": 86400,
    "behavior": "classical",
    "proxy": "国外代理",
    "url": "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Download/Download.yaml",
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
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-range6": "2001:2::1/64",
  "fake-ip-filter-mode": "blacklist",
  "fake-ip-filter": [
    "geosite:private",
    "geosite:category-stun",
    "+.lan",
    "+.local",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "+.stun.*.*",
    "+.stun.*.*.*",
    "+.stun.*.*.*.*",
    "stun.*.*",
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
      "system"
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

  // ================= 1. 进程与应用特权补丁层（特殊协议与核心实时通讯） =================
  // 前置于 STUN 捕获层：保障国内音视频通话及 P2P 游戏的 STUN 打洞包与后续媒体流统一走国内直连；
  // 浏览器不在特权进程列表内，其 WebRTC STUN 请求会继续落入下方第 2 层走国外代理，严防真实 IP 泄露
  // --- 关键 P2P / 原始生 IP 保护（目的地规则无法可靠覆盖的特权程序） ---
  "PROCESS-NAME,imFile.exe,国内直连",          // imFile 下载管理器 (防海量海外生 IP 涌入代理并保障 BT/uTP 满速)
  "PROCESS-NAME,imfile.exe,国内直连",
  "PROCESS-NAME,heroes.exe,国内直连",          // 洛奇英雄传 (核心对局/动态 P2P 房主 UDP 直连)

  // --- 桌面核心实时通讯观察组（保障语音/视频/会议 UDP 低延迟，同时兼容微信 3.x/国际版与 4.0+） ---
  "PROCESS-NAME,Weixin.exe,国内直连",          // 微信 4.0+ 新架构主进程
  "PROCESS-NAME,WeChat.exe,国内直连",          // 微信 3.x 旧版及国际版桌面进程
  "PROCESS-NAME,QQ.exe,国内直连",
  "PROCESS-NAME,WXWork.exe,国内直连",          // 企业微信
  "PROCESS-NAME,wemeetapp.exe,国内直连",       // 腾讯会议
  "PROCESS-NAME,wemeet_room.exe,国内直连",     // 腾讯会议分室

  // --- 移动端核心实时通讯观察组（Android 包名规则，Google Play 版 WeChat 与国内版微信包名同为 com.tencent.mm；iOS 自动跳过由下游规则接管） ---
  "PROCESS-NAME,com.tencent.mm,国内直连",            // 微信 / WeChat (Google Play)
  "PROCESS-NAME,com.tencent.mobileqq,国内直连",      // QQ
  "PROCESS-NAME,com.tencent.wework,国内直连",        // 企业微信
  "PROCESS-NAME,com.tencent.wemeet.app,国内直连",    // 腾讯会议

  // ================= 2. STUN / TURN 高优先级捕获层 =================
  // 捕获浏览器及非特权应用的全部 WebRTC STUN/TURN 探测（含网页调用的国内 STUN），防止泄露国内真实 IP
  "GEOSITE,category-stun,国外代理",
  "DOMAIN-KEYWORD,stun,国外代理",
  "DST-PORT,3478,国外代理",
  "DST-PORT,5349,国外代理",
  "DST-PORT,19302-19309,国外代理",

  // ================= 3. 目标化国内域名 UDP 端口限制（零 DNS 解析） =================
  // 优先拦截已知 CN 域名的 UDP/443 与 UDP/8443；基于纯 IP 的 GEOIP,CN 拦截后置到海外域名规则之后，避免拖慢海外 QUIC 首包
  "AND,((NETWORK,udp),(DST-PORT,443),(GEOSITE,cn)),REJECT",
  "AND,((NETWORK,udp),(DST-PORT,8443),(GEOSITE,cn)),REJECT",

  // ================= 4. 下载与常规域名分流 =================
  // 专用下载器与 BT 走国内直连；浏览器下载海外被墙文件走下方国外代理规则
  "RULE-SET,Download,国内直连",
  "RULE-SET,Telegram,国外代理",
  "GEOSITE,apple-cn,国内直连",
  "GEOSITE,geolocation-!cn,国外代理",
  "GEOSITE,cn,国内直连",

  // ================= 5. 纯 IP / 未收录域名的 CN UDP 限制与国内兜底 =================
  // 置于 geolocation-!cn 之后：海外域名已在上方直接出站，仅对落到此处的流量解析判定是否为 CN 目标并抑制 UDP 443/8443
  "AND,((NETWORK,udp),(DST-PORT,443),(GEOIP,CN)),REJECT",
  "AND,((NETWORK,udp),(DST-PORT,8443),(GEOIP,CN)),REJECT",
  "GEOIP,CN,国内直连",

  // ================= 6. 最终兜底出站 =================
  "MATCH,国外代理"
];

function main(config) {
  var hasProxies = Boolean(config && config.proxies && Array.isArray(config.proxies) && config.proxies.length > 0);
  var hasProviders = Boolean(config && typeof config["proxy-providers"] === "object" && config["proxy-providers"] !== null && Object.keys(config["proxy-providers"]).length > 0);

  if (!hasProxies && !hasProviders) {
    throw new Error("配置文件中未找到任何代理节点或订阅源 (proxies / proxy-providers)");
  }

  // 兜底补齐 1：确保常规 proxies 数组中的自建节点开启 UDP 转发能力
  if (hasProxies) {
    for (var j = 0; j < config.proxies.length; j++) {
      var proxy = config.proxies[j];
      if (proxy && typeof proxy === "object") {
        proxy.udp = true;
      }
    }
  }

  // 兜底补齐 2：在保留原 override 参数的前提下，确保 proxy-providers 自建订阅源节点开启 UDP 转发能力
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

  var groupLoadBalance = mergeOptions(loadBalanceBaseOption, {
    "name": "国外负载均衡",
    "type": "load-balance",
    "strategy": "round-robin",
    "include-all": true,
    "exclude-filter": "官网|套餐|流量|异常|剩余",
    "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
  });

  var groupProxy = mergeOptions(selectBaseOption, {
    "name": "国外代理",
    "type": "select",
    "proxies": ["国外负载均衡"],
    "include-all": true,
    "exclude-filter": "官网|套餐|流量|异常|剩余",
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
  config["geo-update-interval"] = 720; // 720 小时 = 30 天
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
