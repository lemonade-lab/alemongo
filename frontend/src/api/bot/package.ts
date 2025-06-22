import { request } from "../base";

// 
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
