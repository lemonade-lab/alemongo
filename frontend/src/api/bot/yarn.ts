import { request } from "../base";

/**
 * yarn 包管理器
 */

/**
 * 
 * @param data 
 * @returns 
 */
export const apiBotYarnInstall = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/yarn/install",
            method: 'POST',
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
