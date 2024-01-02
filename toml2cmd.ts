import Toml from "@iarna/toml";
import fs from "fs";
import { RecordFile } from "./types";

const fileName = process.argv[2];
const file = fs.readFileSync(fileName, "utf-8").toString();
const data = Toml.parse(file) as { [key: string]: RecordFile };

// 输出为ffmpeg下载命令
for (const key in data) {
    console.log(`ffmpeg -i "${data[key].m3u8}" "${fileName}_${key}.mp4"`);
}