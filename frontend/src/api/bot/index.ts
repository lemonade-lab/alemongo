
import { request } from "../base";
import { BotInfo } from "../types";

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
            .catch(reject);
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
            .catch(reject);
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
            .catch(reject);
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
            .catch(reject);
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
            .catch(reject);
    });
}

export const apiBotLog = async (data: {
    name: string
    timestamp?: number
}): Promise<string> => {
    return new Promise((resolve, reject) => {
        request({
            url: "/bot/log",
            method: "post",
            data,
        })
            .then((res) => res.data)
            .then(resolve)
            .catch(reject);
    });
}

export * from './configs'
export * from './config'
export * from './package'
export * from './packages'
export * from './yarn'