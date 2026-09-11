import type { Command } from "../terminal/types.js";

const file: Command = (args, _stdin, shell) => {
    if (args.length === 0) {
        return "file: missing operand";
    }

    if (shell.currentDirectoryId === null) {
        return "file: cannot determine current directory";
    }

    const output: string[] = [];

    for (const path of args) {
        const target = shell.paths.resolve(
            path,
            shell.currentDirectoryId
        );

        if (!target) {
            output.push(
                `${path}: cannot open: No such file or directory`
            );
            continue;
        }

        output.push(
            `${path}: ${"content" in target ? "regular file" : "directory"}`
        );
    }

    return output.join("\n");
};

export default file;
    