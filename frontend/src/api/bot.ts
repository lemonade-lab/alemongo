import { message } from "antd";
import { request } from "./base";
import { BotInfo } from "./types";


export const apiBotList = async (): Promise<BotInfo[]> => {
    return request({
        url: "/bot/list",
    }).then((res) => res.data);
};

/**
 * 
 * @param data 
 * @returns 
 */
export const apiBotCreate = async (data: { name: string }) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/create",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
};

export const apiBotRun = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/run",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}

export const apiBotStop = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/stop",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}

export const apiBotInstall = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/install",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}

export const apiBotDelete = async (data: {
    name: string
}) => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/info",
            method: "delete",
            params: data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}

export const apiBotInfo = async (data: {
    name: string
}): Promise<BotInfo> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/info",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}

export const apiBotLog = async (data: {
    name: string
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/log",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}

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
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}

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
            .catch((err) => {
                if (err?.response?.data?.msg) {
                    message.error(err.response.data.msg);
                }
                reject(err);
            });
    });
}