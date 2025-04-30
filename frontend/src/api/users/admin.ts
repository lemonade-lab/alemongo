import { request } from "../base";

export const apiUserList = async () => {
    return request({
        url: "/user/list",
        method: "get",
    }).then((res) => res.data);
};

export const apiUserCreate = async (data: {
    username: string;
    password: string;
}) => {
    return request({
        url: "/user/create",
        method: "post",
        data,
    }).then((res) => res.data);
}

// delete
export const apiUserDelete = async (data: {
    username: string;
}) => {
    return request({
        url: "/user/delete",
        method: "delete",
        params: data,
    }).then((res) => res.data);
}