import server from "./base";
import { Info } from "./types";
export * from './users';
export * from './bot';
export * from './types'

export const apiCommonInfo = async (): Promise<{
    data: Info
}> => {
    return server({
        url: "/common/info",
        method: "get",
    }).then((res) => res.data);
}

