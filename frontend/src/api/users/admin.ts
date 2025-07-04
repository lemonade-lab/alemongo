import { request } from "../base";

export const apiUserList = async () => {
    return request({
        url: "/user/list",
        method: 'GET',
    }).then((res) => res.data);
};

export const apiUserCreate = async (data: {
    username: string;
    password: string;
    identity: string;
}) => {
    return request({
        url: "/user/create",
        method: 'POST',
        data,
    }).then((res) => res.data);
}

// delete
export const apiUserDelete = async (data: {
    username: string;
}) => {
    return request({
        url: "/user/delete",
        method: 'DELETE',
        data: data,
    }).then((res) => res.data);
}