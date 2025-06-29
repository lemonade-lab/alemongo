import { request } from "../base";

/**
 * env 是 机器人的 环境配置
 */

/**
 * 
 * @param data 
 * @returns 
 */
export const apiBotEnv = async (data: {
    name: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/env",
            method: 'POST',
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
/**
 * 
 * @param data 
 * @returns 
 */
export const apiBotEnvUpdate = async (data: {
    name: string
    content: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/env",
            method: 'PUT',
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
