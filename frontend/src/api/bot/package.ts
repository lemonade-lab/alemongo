import { request } from "../base";

/**
 * packages 是 机器人的 包配置
 */

/**
 * 
 * @param data 
 * @returns 
 */
export const apiBotPackage = async (data: {
    name: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/package",
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
export const apiBotPackageUpdate = async (data: {
    name: string
    content: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/package",
            method: 'PUT',
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
