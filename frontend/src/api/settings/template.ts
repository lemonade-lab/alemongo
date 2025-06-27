import { request } from "../base";

/**
 * 重置机器人模板
 * @param data 
 * @returns 
 */
export const apiResetTemplate = async () => {
    return new Promise((resolve, reject) => {
        request({
            url: "/settings/template/reset",
            method: 'POST',
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
