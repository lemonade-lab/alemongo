import { request } from "../base";

export const apiSSHList = async () => {
    return request({
        url: "/ssh/list",
        method: "get",
    }).then((res) => res.data);
};

export const apiSSHRead = async (data: {
    name: string;
}) => {
    return request({
        url: "/ssh/read",
        method: "get",
        params: data,
    }).then((res) => res.data);
}


export const apiSSHUpdate = async (data: {
    name: string;
    content: string;
}) => {
    return request({
        url: "/ssh/update",
        method: "put",
        data,
    }).then((res) => res.data);
}

// delete
export const apiSSHDelete = async (data: {
    name: string;
}) => {
    return request({
        url: "/ssh/delete",
        method: "delete",
        params: data,
    }).then((res) => res.data);
}

export const apiSSHGenerate = async (data: {
    key_type: string,
    bit_size: number,
    comment: string,
    name: string,
    passphrase?: string,
    hash_algo?: string,
    key_format?: string,
}) => {
    return request({
        url: "/ssh/generate",
        method: "post",
        data,
    }).then((res) => res.data);
};