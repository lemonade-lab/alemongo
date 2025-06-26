import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    timeout: 1000 * 60 * 3, // 3分钟超时
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    }
});

export const TOKEN_KEY = 'alemongo:token';

export const QQ_TEMPLATE_KEY = 'alemongo:qq:template';

export const server = async (config: AxiosRequestConfig) => {
    return api(config).then(res => res.data).catch((err) => {
        if (err?.response?.data?.msg) {
            message.error(err.response.data.msg);
        }
        if (err?.response?.status === 404) {
            message.error("API未找到，请检查网络连接或联系管理员");
        }
        else if (err?.response?.status === 500) {
            message.error("服务器错误，请稍后再试");
        }
    })
}

export const request = async (config: AxiosRequestConfig) => {
    const { headers, ...cfg } = config;
    return api({
        headers: {
            "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            "Content-Type": "application/x-www-form-urlencoded",
            ...headers
        },
        ...cfg,
    }).then(res => res.data).catch((err) => {
        if (err?.response?.data?.msg) {
            message.error(err.response.data.msg);
        }
        if (err?.response?.status === 401) {
            window.location.href = "/login";
        }
        else if (err?.response?.status === 404) {
            message.error("API未找到，请检查网络连接或联系管理员");
        }
        else if (err?.response?.status === 500) {
            message.error("服务器错误，请稍后再试");
        }
    })
}

export default server;