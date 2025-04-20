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
    }).then(res => res.data)
}

export default server;