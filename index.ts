import puppeteer, * as Puppeteer from "puppeteer";
import Toml from "@iarna/toml";
import fs from "fs";
import dayjs from "dayjs";
import chalk from "chalk";

import * as Types from "./types";
import * as $ from "./selectors";
import * as utils from "./utils";

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
const safeMkdir = (dir: string) => {
    try { fs.mkdirSync(dir) } catch { }
};

const data = Toml.parse(fs.readFileSync("./data.toml", "utf-8")) as Types.TomlData;

const outputData: Types.RecordFileSave = {};


// 打开页面并开始监听请求
const pageOpener = async (page: Puppeteer.Page, singleClass: Types.TomlSingleClassData) => {

    console.log("正在打开课程: " + chalk.yellow(singleClass.name));

    page.on("response", async (response) => {
        const status = response.status();
        if (status != 200) return;

        const responseData = await response.text();

        // if (responseData.includes("m3u8")) {
        //     console.log("response m3u8:", response.url());
        // }

        if (response.url().includes("watch-api.polyv.cn/v3/common/channel/viewer")) {

            try {

                const recordFile = JSON.parse(responseData).data.playbackInfo.recordFile as Types.RecordFile;

                outputData[singleClass.name] = {
                    fileId: recordFile.fileId,
                    m3u8: recordFile.m3u8,
                    mp4: recordFile.mp4,
                } as Types.SingleRecordFileSave;
                
                if (recordFile.m3u8) console.log("m3u8: " + chalk.green(recordFile.m3u8));
                if (recordFile.mp4) console.log("mp4:  " + chalk.green(recordFile.mp4));

            } catch (e) { }
        }

        if (response.url().includes("watch-api.polyv.cn/v3/common/auth/phone-auth/check")) {
                
                try {
    
                    const responseJSON = JSON.parse(responseData);
    
                    if (responseJSON.code == 400) {
                        console.log(chalk.red("用户名错误"));
                    }
    
                } catch (e) { }
        }
    });

    await page.goto(singleClass.url);

    console.log("页面打开中");

    await sleep(3000);
    // await page.waitForNavigation();

    console.log("页面打开成功");

    await page.click($.loginButton);
    await page.click($.loginInput);
    await page.keyboard.type(singleClass.user.toString());
    await page.click($.loginSubmit);

    await sleep(2000);

    await page.close();

    return;
};


const saveResults = async () => {

    console.log();
    console.log(chalk.black.bgCyanBright(" 课程视频 "));
    console.log();

    for (const key in outputData) {
        console.log("课程名称: " + chalk.yellow(key));
        if (outputData[key].m3u8) console.log("m3u8: " + chalk.green(outputData[key].m3u8));
        if (outputData[key].mp4) console.log("mp4:  " + chalk.green(outputData[key].mp4));
        console.log();
    }

    const fileName = `./download/${dayjs().format("YYMMDD_HHmmss")}.toml`;

    safeMkdir("./download");

    const tomlFile = Toml.stringify(outputData);
    fs.writeFileSync(fileName, tomlFile);

    console.log(`已保存到 ${chalk.green(fileName)}`);

    await utils.SendDingtalkMessage(data.config.dingtalk_token, tomlFile);

    console.log(`消息内容已推送到钉钉`);
};


(async () => {


    // console.log(data.data);

    for (const url of data.data) {
        console.log("课程名称: " + chalk.yellow(url.name));
        console.log("链接: " + chalk.green(url.url));
        console.log("用户名: " + chalk.blue(url.user));
        console.log();
    }

    const browser = await puppeteer.launch({
        headless: false,
    });

    for (const url of data.data) {
        const page = await browser.newPage();
        await pageOpener(page, url);
        await sleep(1000);
    }

    saveResults();

    browser.close();
    
    return;

})();


process.on('SIGINT', function () {
    saveResults();
    process.exit();
});