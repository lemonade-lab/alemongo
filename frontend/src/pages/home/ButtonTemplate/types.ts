// 定义按钮类型
export type DataButton = {
    "id": string,
    "render_data": {
        "label": string,
        "visited_label": string,
        "style": number // 0: 灰色线框, 1: 蓝色线框, 3: 红色文字, 4: 蓝色背景
    },
    "action": {
        "type": number,
        "permission": {
            "type": number,  // 0: 指定角色, 1: 管理员, 2: 所有人
            "specify_role_ids": string[]
        },
        "click_limit": number,
        "unsupport_tips": string,
        "data": string,
        "at_bot_show_channel_list": boolean,
        "enter": boolean
    }
}

// 定义按钮行的类型
export type DataRow = {
    id: number;
    buttons: DataButton[];
};

export type EditFormValues = {
    label: string;
    visited_label: string;
    data: string;
    type: number;
    style: number;
    permission: number;
    click_limit: number;
    unsupport_tips: string;
    at_bot_show_channel_list: boolean;
    enter: boolean;
};

