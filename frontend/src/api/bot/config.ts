import { request } from "../base";

/**
 * config 是机器人的运行配置
 */

/**
 * 
 * @param data 
 * @returns 
 */
export const apiBotConfig = async (data: {
    name: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/config",
            method: 'POST',
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
            url: "/bot/config",
            method: 'PUT',
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
