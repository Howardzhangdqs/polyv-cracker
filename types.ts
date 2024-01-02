export type TomlSingleClassData = {
    name: string,
    url: string,
    user: number | number[],
}

export type TomlData = {
    data: TomlSingleClassData[],
    config: {
        dingtalk_token: string,
    }
};

export type RecordFile = {
    m3u8: string,
    mp4: string,
    fileId: string,
    [key: string]: string,
};

export type SingleRecordFileSave = {
    m3u8?: string,
    mp4?: string,
    fileId?: string,
};

export type RecordFileSave = {
    [key: string]: SingleRecordFileSave,
};

