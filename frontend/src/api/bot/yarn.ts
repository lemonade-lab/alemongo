import { request } from "../base";

export const apiBotYarnInstall = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/yarn/install",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}
