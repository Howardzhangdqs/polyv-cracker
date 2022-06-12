const chrome    = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const fetch     = require('node-fetch');
const axios     = require('axios');
const fs        = require('fs');

const wait      = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const download_path = "课件下载";

var data_list = [
    ["https://live.polyv.cn/splash/1919810", 114512, "直播1"],
    ["https://live.polyv.cn/splash/1919812", 114514, "直播2"],
    ["https://live.polyv.cn/splash/1919833", 114533, "直播3"],
];

let By = webdriver.By;
var option = new chrome.Options();
option.addArguments("log-level=3");
option.setUserPreferences({'profile.default_content_setting_values.notifications': 2});

var driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(option).build();

var click = function(str) {
	let target = driver.findElement(By.css(str));
	target.click();
};

var sendkey = function(str, key) {
	driver.findElement(By.css(str)).sendKeys(key);
};

Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var s in/(y+)/i.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+s+")","i").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t};

var res = [];

(async () => {
	await driver.manage().window().minimize();
	for (let i in data_list) {
		await driver.get(data_list[i][0]);
		
		await wait(100);
		process.stdout.write(data_list[i][0] + " " + data_list[i][2] + " opened");
		
		let flag = true; while (flag) try { await click(".btn.btn-watch.btn-auth1"); flag = false } catch { flag = true }
		await sendkey("#checkPhone", data_list[i][1]);
		await click("#phonecheck");
		
		process.stdout.write(" Entered\n");
		await wait(100);
		
		let videoinfo = await driver.executeScript('return window.chatData');
		while (! videoinfo) { await wait(100); videoinfo = await driver.executeScript('return window.chatData') }
		
		console.log(videoinfo.vodsrc); res.push([videoinfo.vodsrc, data_list[i][2]]);
		
		let fileId = videoinfo.fileId, channelId = videoinfo.channelId;
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
})();