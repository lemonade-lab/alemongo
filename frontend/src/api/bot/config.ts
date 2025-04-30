import { request } from "../base";

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
