import { request } from "../base"

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
