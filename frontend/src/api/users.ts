import server, { request, TOKEN_KEY } from "./base";

export const apiLogin = async (data: {
    password: string,
    username: string
}) => {
    return server({
        url: "/user/login",
        method: "post",
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
    old_assword: string
}) => {
    return request({
        url: "/user/password",
        method: "put",
        data: data,
    }).then((res) => res.data);
};
