import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';

const server = axios.create({
    baseURL: '/api/v1',
    timeout: 6000,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    }
});

export const TOKEN_KEY = 'alemongo:token';

export const QQ_TEMPLATE_KEY = 'alemongo:qq:template';

export const request = async (config: AxiosRequestConfig) => {
    const { headers, ...cfg } = config;
    return server({
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
        // 如果错误码为 401。要前往登录
        if (err?.response?.status === 401) {
            window.location.href = "/login";
        }
        // 继续抛出错误
        throw err;
    })
}

export default server;