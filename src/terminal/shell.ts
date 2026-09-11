import type { User } from "../users/user.js";
import type { GameFileSystem } from "../filesystem/index.js";

import { parseCommand } from "../libs/parser.js";
import { Executor } from "./executor.js";

export class Shell {
    public currentUser: User | null;
    public currentDirectoryId: number | null;
    public hostname: string;

    private executor: Executor;
    public fs: GameFileSystem;

    constructor(fs: GameFileSystem) {
        this.currentUser = null;
        this.currentDirectoryId = null;
        this.hostname = "HackNetPc";

        this.fs = fs;
        this.executor = new Executor(this);
    }

    execute(command: string): string {
        const ast = parseCommand(command);

        return this.executor.execute(ast);
    }

    getPrompt(): string {
        const username = this.currentUser?.username ?? "unknown";

        const path = this.currentDirectoryId === null
            ? "?"
            : this.getCurrentPath();

        const symbol = this.currentUser?.isRoot ? "#" : "$";

        return `${username}@${this.hostname}\n${path}${symbol} `;
    }

    getFileSystem(): GameFileSystem {
        return this.fs;
    }

    private getCurrentPath(): string {
        if (this.currentDirectoryId === null) {
            return "/";
        }

        const parts: string[] = [];
        let currentId: number | null = this.currentDirectoryId;

        while (currentId !== null) {
            const directory = this.fs.getDirectoryById(currentId);

            if (!directory) {
                return "/";
            }

            if (directory.parent_id === null) {
                break;
            }

            parts.unshift(directory.name);
            currentId = directory.parent_id;
        }

        return "/" + parts.join("/");
    }
}
