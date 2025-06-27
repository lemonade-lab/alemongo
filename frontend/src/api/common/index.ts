import server from "../base";
import { Info } from "../types";

export const apiCommonInfo = async (): Promise<{
    data: Info
}> => {
    return server({
        url: "/common/info",
        method: 'GET',
    }).then((res) => res.data);
}

