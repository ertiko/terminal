import type { User } from "../users/user.js";
import type { GameFileSystem } from "../filesystem/index.js";
import type { PathResolver } from "../filesystem/pathResolver.js";

import { parseCommand } from "../libs/parser.js";
import { Executor } from "./executor.js";

export class Shell {
    public currentUser: User | null;
    public currentDirectoryId: number | null;
    public hostname: string;

    private executor: Executor;
    public fs: GameFileSystem;
    public paths: PathResolver;

    constructor(fs: GameFileSystem, pathResolver: PathResolver) {
        this.currentUser = null;
        this.currentDirectoryId = null;
        this.hostname = "HackNetPc";

        this.fs = fs;
        this.paths = pathResolver;
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
            const directoryResult = this.fs.getDirectoryById(currentId);

            if (directoryResult.success === false) {
                return "/";
            }

            const directory = directoryResult.value;

            if (directory.parent_id === null) {
                break;
            }

            parts.unshift(directory.name);
            currentId = directory.parent_id;
        }

        return "/" + parts.join("/");
    }
}
