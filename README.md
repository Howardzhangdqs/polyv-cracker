# 保利威（Polyv）直播破解器

本版本适用于保利威2022年7月Vue后端版

## 直播账号爆破

**说明：仅对含有密码的直播有效，通过`node-fetch`发送小型攻击包爆破密码**

v0.9版本无需更改源代码即可直接使用

`Blast.exe`同时提供CLI工具和双击打开使用方法

CLI Usage如下：

```
usage: Blast.js [-h] [-v] [-c CLASS] [-l LOWER] [-u UPPER] [-o]

Blast for Polyv 保利威直播账号爆破器

optional arguments:
  -h, --help            show this help message and exit
  -v, --version         show program's version number and exit
  -c CLASS, --class CLASS
                        需要破解的直播id或直播链接 (可在程序运行后输入)
  -l LOWER, --lower LOWER
                        起始破解账号的下限 (默认值：100000) (可在程序运行后输入)
  -u UPPER, --upper UPPER
                        起始破解账号的上限 (默认值：200000) (可在程序运行后输入)
  -o, --once            遇到可用账号立即停止
```

双击打开使用方法：

打开后按要求依次输入【需要破解的直播id或直播链接】【爆破下限】【爆破上限】即会自动开始爆破。

在爆破完毕后会统一输出可用账号。

<br>

## 直播回放及课件下载

**说明：仅对含有回放的直播有效，通过Google浏览器的Webdriver进行站点爬取，请先预先配置好Google Chrome的Webdriver**

v0.9版本无需更改源代码即可直接使用

**`fetch-url.exe`仅提供CLI工具进行配置，若双击运行全部配置将使用默认值。**

CLI Usage如下：

```
usage: fetch-url.js [-h] [-v] [-c CONFIG] [-o OUTPUT]

Downloader for Polyv 保利威直播账号下载器

optional arguments:
  -h, --help            show this help message and exit
  -v, --version         show program's version number and exit
  -c CONFIG, --config CONFIG
                        链接、账号存储文件 (具体格式请见README文件) (默认值: "config.json")
  -o OUTPUT, --output OUTPUT
                        课件输出路径 (默认值: "课件下载")
```

config.json存储文件格式（具体示例可见本文件夹下的config.json）：

```json
[
	[直播链接(type:string), 账号(type:int), 课程名称(type:string)],
    ...以下多条格式同上
]
```

运行时由于网络原因可能报错，重新启动程序即可。
如多次启动仍然报错，请联系作者我 <zjh@shanghaiit.com>

退出前输出的`FFmpeg download command`可在配置了`FFmpeg`环境变量的电脑上直接复制入`cmd`运行，将会自动下载相应的直播回放视频。

如未配置`FFmpeg`，可用本项目文价夹内提供的`FFmpeg`凑合。

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

同时，如果直播内有使用课件进行讲述，会在当前目录下创建文件并自动下载课件照片，文件树形如：

```
{{ CLI中配置的OUTPUT }}
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

