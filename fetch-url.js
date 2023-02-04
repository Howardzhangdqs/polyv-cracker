'use strict';

const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const fetch = require('node-fetch');
const axios = require('axios');
const hjson = require('hjson');
const path = require("path");
const fs = require('fs');
const chalk = require("chalk");
const ProgressBar = require("progress");
const ArgumentParser = require('argparse').ArgumentParser;

const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const question = (query) => new Promise(resolve => rl.question(query, (answer) => resolve(answer)));

var download_path = "课件下载";

const parser = new ArgumentParser({
	description: 'Downloader for Polyv 保利威直播账号下载器',
});

parser.add_argument('-v', '--version', { action: 'version', version: "v0.9.3" });
parser.add_argument('-c', '--config', { help: '链接、账号存储文件 (具体格式请见README文件) (默认值: "config.hjson") (兼容Hjson)', default: "config.hjson" });
parser.add_argument('-o', '--output', { help: '课件输出路径 (默认值: "课件下载")', default: "课件下载" });

var args = parser.parse_args();

var data_list = hjson.parse(fs.readFileSync(args.config, 'utf-8'));
download_path = args.output;

let By = webdriver.By;
var option = new chrome.Options();
option.addArguments("log-level=3");
option.setUserPreferences({ 'profile.default_content_setting_values.notifications': 2 });

var driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(option).build();

var click = (str) => driver.findElement(By.css(str)).click();

var sendkey = (str, key) => driver.findElement(By.css(str)).sendKeys(key);

Date.prototype.format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o) if (new RegExp("(" + k + ")").test(fmt))
		fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

const logger = (s = "", file_name = ".log") => fs.appendFileSync(path.resolve(file_name), new Date().format("[yyMMdd hh:mm:ss.S]") + s + "\n")

var res = [];

const safe_mkdir = (dir) => {
	try { fs.mkdirSync(dir) } catch { }
}

(async () => {
	await driver.manage().window().maximize();
	await wait(100);
	for (let i in data_list) {
		console.log()

		// 打开网页
		await driver.get(data_list[i].url);
		await wait(5000);
		console.log("> " + data_list[i].url + " " + data_list[i].name + " URL Opened");

		// 输入账号
		let flag = true;
		while (flag)
			try {
				await click(".c-auth__btn.pws-btn-bg-color");
				flag = false;
			} catch { flag = true }
		await wait(100);
		await click("[name=code]");
		await wait(100);
		await sendkey("[name=code]", data_list[i].user);
		await wait(100);
		await click("[type=submit]");

		console.log("> Password Entered");
		await wait(3000);

		// 获取直播信息
		let key_code = data_list[i].url.split("/"); key_code = key_code[key_code.length - 1];
		await driver.get("https://live.polyv.cn/v2/watch/channel/detail?channelId=" + key_code);
		await wait(3000);
		let videoinfo = await driver.executeScript('return (document.body.innerText)');

		// 获取回放链接
		videoinfo = JSON.parse(videoinfo).data.channelPlayback.recordFile;

		logger(JSON.stringify({ info: data_list[i], url: videoinfo }), "videoinfo.log");

		console.log(videoinfo)

		res.push([videoinfo, data_list[i].name, data_list[i]]);

		// 获取课件信息
		let fileId = videoinfo.fileId, channelId = key_code;
		target = "https://apichat.polyv.net/ppt-records/record/" + channelId + "/" + fileId + ".json";
		let fileinfo = JSON.parse(await (await fetch(target)).text());

		safe_mkdir(download_path);

		safe_mkdir(download_path + "/" + (new Date().format("yyMMdd")));

		// 去重
		let vis = {};
		for (let j in fileinfo) vis["" + fileinfo[j].autoId] = true;

		for (let j in vis)
			if (parseInt(j) > 1) {
				console.log(`获取编号为${chalk.green(j)}的课件中`);
				let filepic = await (await fetch("https://doc-2.polyv.net/data/" + j + ".json")).text();

				//logger(filepic, ".bookinfo.log");

				filepic = JSON.parse(filepic);

				let picls = filepic.convertFileJson.images;

				console.log(`将下载来自课件"${filepic.fileName}"的${chalk.green(picls.length)}张照片`);

				// 进度条
				let progress = new ProgressBar('[:bar] :rate/bps :percent :etas', {
					complete: '=',
					incomplete: ' ',
					total: picls.length,
					clear: true,
				});

				const current_dir = download_path + "/" + (new Date().format("yyMMdd")) + "/" + data_list[i].name;

				safe_mkdir(current_dir);

				// 下载
				for (let k in picls) {
					await axios({
						method: 'get', url: picls[k], responseType: 'stream'
					}).then(function (rsp) {
						rsp.data.pipe(
							fs.createWriteStream(
								current_dir + "/" + filepic.fileName + "_" + picls[k].split("_")[1]
							)
						)
					});
					progress.tick();
				}
				console.log(`下载成功，已存储在目录"${current_dir}"下`);
			}
	}

	driver.quit();

	console.log("\n FFmpeg download command for m3u8");
	for (let i in res) console.log("ffmpeg -i " + res[i][0].m3u8 + " " + res[i][1] + "." + (res[i][2].ext || "mp4"));

	console.log("\n FFmpeg download command for mp4");
	for (let i in res) console.log("ffmpeg -i " + res[i][0].mp4 + " " + res[i][1] + "." + (res[i][2].ext || "mp4"));

	await question("\n按回车键以退出");
	process.exit(0);
})();
