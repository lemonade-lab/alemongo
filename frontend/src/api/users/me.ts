import server, { request, TOKEN_KEY } from "../base";

export const apiLogin = async (data: {
    password: string,
    username: string
}) => {
    return server({
        url: "/user/login",
        method: 'POST',
        data: data,
    }).then((res) => res.data);
};

/**
 *
 * @returns
 */
export const apiLogout = async () => {
    return request({
        url: "/user/logout",
        method: 'GET',
    }).then((res) => {
        localStorage.removeItem(TOKEN_KEY);
        return res;
    });
};

/**
 * 
 * @param data 
 * @returns 
 */
export const apiPassword = async (data: {
    password: string,
    old_password: string
}) => {
    return request({
        url: "/user/password",
        method: 'PUT',
        data: data,
    }).then((res) => res.data);
};

export const apiInfo = async () => {
    return request({
        url: "/user/info",
        method: 'GET',
    }).then((res) => res.data);
}