import type { UserInterface } from "./types.ts";

import { generateId } from "../libs/id.js";

export class User implements UserInterface {
    id: number;
    username: string;
    password: string;
    isRoot: number;

    constructor(username: string, password: string, isRoot: number) {
        this.id = generateId();
        this.username = username;
        this.password = password;
        this.isRoot = isRoot;
    }
}
