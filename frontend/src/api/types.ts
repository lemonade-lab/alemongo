
export type BotInfo = {
    name: string;
    status: number;
    pid: number;
    node_modules: boolean
    create_at: string;
}

export type Info = {
    nvm: {
        installed: boolean;
        version: string;
    },
    node: {
        installed: boolean;
        version: string;
    },
    browser: {
        installed: boolean;
        version: string;
    },
    git: {
        installed: boolean;
        version: string;
    },
    base: {
        version: string;
        build_time: string;
    }
    start_at: string
    location: string
}

export type User = {
    username: string;
    password: string;
    identity: string;
    mastername: string;
}