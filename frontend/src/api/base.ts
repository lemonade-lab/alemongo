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
        // 携带错误信息
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
        else if (err?.response?.status === 403) {
            message.error("没有权限访问该资源");
        }
        // 继续抛出错误
        throw err;
    })
}

export default server;