const chrome    = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const fetch     = require('node-fetch');
const axios     = require('axios');
const fs        = require('fs');
const ArgumentParser = require('argparse').ArgumentParser;

const rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const question = (query) => new Promise(resolve => rl.question(query, (answer) => resolve(answer)));

var download_path = "课件下载";

const parser = new ArgumentParser({
	description: 'Downloader for Polyv 保利威直播账号下载器',
});

parser.add_argument('-v', '--version', { action: 'version', version: "v0.9.3" });
parser.add_argument('-c', '--config',  { help: '链接、账号存储文件 (具体格式请见README文件) (默认值: "config.json")', default: "config.json" });
parser.add_argument('-o', '--output',  { help: '课件输出路径 (默认值: "课件下载")', default: "课件下载" });

var args = parser.parse_args();

var data_list = JSON.parse(fs.readFileSync(args.config, 'utf-8'));
download_path = args.output;

let By = webdriver.By;
var option = new chrome.Options();
option.addArguments("log-level=3");
option.setUserPreferences({'profile.default_content_setting_values.notifications': 2});

var driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(option).build();

var click = function (str) {
	let target = driver.findElement(By.css(str));
	target.click();
};

var sendkey = function (str, key) {
	driver.findElement(By.css(str)).sendKeys(key);
};

Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var s in/(y+)/i.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+s+")","i").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t};

var res = [];

(async () => {
	await driver.manage().window().maximize();
	await wait(100);
	for (let i in data_list) {
		await driver.get(data_list[i][0]);
		
		await wait(1000);
		process.stdout.write(data_list[i][0] + " " + data_list[i][2] + " opened");
		
		let flag = true;
		while (flag)
			try {
				await click(".c-auth__btn.pws-btn-bg-color");
				flag = false
			} catch { flag = true }
		await wait(100);
		await click("[name=code]");
		await wait(100);
		await sendkey("[name=code]", data_list[i][1]);
		await wait(100);
		await click("[type=submit]");
		
		process.stdout.write(" Entered\n");
		await wait(600);
		
		let key_code = data_list[i][0].split("/"); key_code = key_code[key_code.length - 1];
		await driver.get("https://live.polyv.cn/v2/watch/channel/detail?channelId=" + key_code);
		await wait(400);
		let videoinfo = JSON.parse(await driver.executeScript('return (document.body.innerText)')).data.channelPlayback.recordFile;
		console.log(videoinfo)
		//let videoinfo = JSON.parse(await (await fetch("https://doc-2.polyv.net/data/" + key_code + ".json")).text());
		console.log(videoinfo.m3u8);
		console.log(videoinfo.mp4);
		res.push([videoinfo.m3u8, data_list[i][2]]);
		
		let fileId = videoinfo.fileId, channelId = key_code;
		target = "https://apichat.polyv.net/ppt-records/record/" + channelId + "/" + fileId + ".json";
		let fileinfo = JSON.parse(await (await fetch(target)).text());
		
		fs.mkdir(download_path, async () => {
			fs.mkdir(download_path + "/" + (new Date().format("YYMMDD")), async () => {
				let vis = {};
				for (let j in fileinfo) vis["" + fileinfo[j].autoId] = true;
				for (let j in vis) {
					if (parseInt(j) > 1) {
						console.log(j);
						let filepic = JSON.parse(await (await fetch("https://doc-2.polyv.net/data/" + j + ".json")).text());
						let picls = filepic.convertFileJson.images;
						console.log(picls);
						fs.mkdir(download_path + "/" + (new Date().format("YYMMDD")) + "/" + data_list[i][2], (err) => {
							for (let k in picls) {
								axios({
									method: 'get', url: picls[k], responseType: 'stream'
								}).then(function(rsp) {
									rsp.data.pipe(fs.createWriteStream(download_path + "/" + (new Date().format("YYMMDD")) + "/" + data_list[i][2] + "/" + filepic.fileName + "_" + picls[k].split("_")[1]))
								});
							}
						})
					}
				}
			});
		});
	}
	driver.quit();
	process.stdout.write("\n FFmpeg download command\n");
	for (let i in res) process.stdout.write("ffmpeg -i " + res[i][0] + " " + res[i][1] + ".mp4\n");

	await question("\n按回车键以退出");
	process.exit(0);
})();