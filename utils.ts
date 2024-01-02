import axios from "axios";
import chalk from "chalk";

export const SendDingtalkMessage = async (dingtalkToken: string, message: string) => {
    if (!dingtalkToken) {
        console.log(chalk.black.bgRed(" 配置错误 ") + " 未配置钉钉机器人");
        return;
    }

    const url = `https://oapi.dingtalk.com/robot/send?access_token=${dingtalkToken}`;

    const res = await axios.post(url, { text: { "content": message, }, msgtype: "text" });

    // console.log(res);
};