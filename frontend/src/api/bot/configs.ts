import { request } from "../base";

/**
 * configs 是机器人的配置列表
 */

/**
 * 
 * @returns 
 */
export const apiBotConfigsList = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/configs/list",
            method: 'GET',
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export const apiBotConfigsUpdate = async (data: {
    name: string
    content: string
}): Promise<null> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/configs/update",
            method: 'POST',
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
            method: 'POST',
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

// delete
export const apiBotConfigsDelete = async (data: {
    name: string
}): Promise<null> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/configs/delete",
            method: 'DELETE',
            params: data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}