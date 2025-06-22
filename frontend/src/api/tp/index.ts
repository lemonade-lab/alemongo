import { request } from "../base";

/**
 * 绑定
 * @param data 
 * @returns 
 */
export const apiResetTemplate = async () => {
    return new Promise((resolve, reject) => {
        request({
            url: "/settings/template/reset",
            method: "post",
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
