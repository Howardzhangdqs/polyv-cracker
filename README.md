# 保利威（Polyv）直播破解器



## 直播账号爆破

**说明：仅对含有密码的直播有效，通过`node-fetch`发送小型攻击包爆破密码**

运行前请修改`Blast.js`中的9至11行

```javascript
var lower_bound = 114500;
var upper_bound = 114600;
var classid = 1919810;
```

其中，`lower_bound`为起始爆破账号，`upper_bound`为末尾爆破账号，即从`lower_bound`开始每次累加1爆破直至`upper_bound`结束。

`classid`获取方式：
直播链接形如：[`https://live.polyv.cn/splash/1919810`](https://live.polyv.cn/splash/1919810)其中`splash`后的`1919810`即为`classid`

运行方式：

```bash
node Blast.js
```

运行结束后的控制台输出：

```
Blaster customized for 保利威（Polyv）
From 114500 to 114600 100 PhoneID in all

Blasting 1919810 with key 114512 SUCCESS
Blasting 1919810 with key 114514 SUCCESS
Blasting 1919810 with key 114533 SUCCESS

Finished Blasting from 114500 to 114599 100 PhoneID in all
```

其中`114512`、`114514`、`114533`即为可登录的账号



## 直播回放及课件下载

**说明：仅对含有回放的直播有效，通过Webdriver进行站点爬取，请先预先配置好Google Chrome的Webdriver**

运行前请修改`fetch-url.js`中的10至14行

```javascript
var lower_bound = 114500;
var upper_bound = 114600;
var classid = 1919810;
```

其中，`lower_bound`为起始爆破账号，`upper_bound`为末尾爆破账号，即从`lower_bound`开始爆破直至`upper_bound`结束。

`classid`获取方式：
[`https://live.polyv.cn/splash/1919810`](https://live.polyv.cn/splash/1919810)其中`splash`后的`1919810`即为`classid`

运行方式：

```bash
node fetch-url.js
```

运行结束后的控制台输出（非重要内容用`……`省去）：

```
DevTools listening on ws://127.0.0.1:59269/devtools/browser/5b93b8ef-509e-4570-b7a7-8ecda03889f1
https://live.polyv.cn/splash/1919810 直播1 opened Entered
https://live-video-qc.videocc.net/……/index.m3u8
3401314
[
  'https://doc-2.polyv.net/images/2022/05/……common_0000.jpeg',
  'https://doc-2.polyv.net/images/2022/05/……common_0001.jpeg',
  'https://doc-2.polyv.net/images/2022/05/……common_0002.jpeg',
]
3450520
[
  'https://doc-2.polyv.net/images/2022/06/……common_0000.jpeg',
  'https://doc-2.polyv.net/images/2022/06/……common_0001.jpeg',
]
3450610
https://live.polyv.cn/splash/1919812 直播2 opened Entered
[
  'https://doc-2.polyv.net/images/2022/06/……common_0000.jpeg',
]
https://live-video-qc.videocc.net/……/index.m3u8
https://live.polyv.cn/splash/1919833 直播3 opened Entered
https://live-video-qc.videocc.net/……/index.m3u8

 FFmpeg download command
ffmpeg -i https://live-video-qc.videocc.net/……/index.m3u8 直播1.mp4
ffmpeg -i https://live-video-qc.videocc.net/……/index.m3u8 直播2.mp4
ffmpeg -i https://live-video-qc.videocc.net/……/index.m3u8 直播3.mp4
```

同时，如果直播内有使用课件进行讲述，会在当前目录下创建文件，文件树形如：

```
课件下载
└─{{ 运行时的日期 }}
    ├─直播1
    │  ├─{{ 课件3401314文件名 }}_0000.jpeg
    │  ├─{{ 课件3401314文件名 }}_0001.jpeg
    │  ├─{{ 课件3450520文件名 }}_0002.jpeg
    │  ├─{{ 课件3450520文件名 }}_0000.jpeg
    │  └─{{ 课件3450520文件名 }}_0001.jpeg
    └─直播2
       └─{{ 课件3450610文件名 }}_0000.jpeg
```

