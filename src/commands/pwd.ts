import type { Command } from "../terminal/types.js";

const pwd: Command = (_args, _stdin, shell) => {
    if (shell.currentDirectoryId === null) {
        return "pwd: cannot determine current directory";
    }

    const parts: string[] = [];
    let currentId: number | null = shell.currentDirectoryId;

    while (currentId !== null) {
        const result = shell.fs.getDirectoryById(currentId);

        if (!result.success) {
            return "pwd: cannot determine current directory";
        }

        const directory = result.value;

        if (directory.parent_id === null) {
            break;
        }

        parts.unshift(directory.name);
        currentId = directory.parent_id;
    }

    return "/" + parts.join("/");
};

export default pwd;
