
import { request } from "./base";
import { BotInfo } from "./types";

export const apiBotList = async (): Promise<BotInfo[]> => {
    return request({
        url: "/bot/list",
    }).then((res) => res.data);
};

/**
 * 
 * @param data 
 * @returns 
 */
export const apiBotCreate = async (data: { name: string }) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/create",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
};

export const apiBotRun = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/run",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotStop = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/stop",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotYarnInstall = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/yarn/install",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotDelete = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/info",
            method: "delete",
            params: data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotInfo = async (data: {
    name: string
}): Promise<BotInfo> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/info",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotLog = async (data: {
    name: string
    timestamp?: number
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/log",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotPackage = async (data: {
    name: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/package",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotPackageUpdate = async (data: {
    name: string
    content: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/package/update",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}


export const apiBotConfig = async (data: {
    name: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/config",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}


export const apiBotConfigsList = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/configs/list",
            method: "get",
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

// /configs/create
export const apiBotConfigsUpdate = async (data: {
    name: string
    content: string
}): Promise<null> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/configs/update",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotPackageClone = async (data: {
    name: string
    repo_url: string
    branch_name: string
}): Promise<null> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/packages/clone",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export type BotPackages = {
    "name": string,
    "git": {
        "repo": string,
        "branch": string,
        "commit": string,
        "author": string,
        "email": string,
        "date": string,
        "msg": string
    },
    "pkg": string,
    "md": string,
    "status": number // 0:未安装 1:已安装
}

export const apiBotPackagesList = async (data: {
    name: string
}): Promise<BotPackages[]> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/packages/list",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}


export const apiBotPackagesPull = async (data: {
    name: string
    repo_name: string
    branch_name: string
}): Promise<null> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/packages/pull",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

// /config/update
export const apiBotConfigUpdate = async (data: {
    name: string
    content: string
}): Promise<null> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/config/update",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}


export const apiBotConfigs = async (data: {
    name: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/configs",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}