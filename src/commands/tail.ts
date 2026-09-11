import type { Command } from "../terminal/types.js";

const tail: Command = (args, stdin, shell) => {
    let lines = 10;
    let path: string | undefined;

    if (args[0]?.startsWith("-")) {
        const value = Number(args[0].slice(1));

        if (!Number.isInteger(value) || value < 0) {
            return `tail: invalid number of lines: '${args[0]}'`;
        }

        lines = value;
        path = args[1];
    } else {
        path = args[0];
    }

    let content = stdin;

    if (path !== undefined) {
        if (shell.currentDirectoryId === null) {
            return "tail: cannot determine current directory";
        }

        const file = shell.paths.resolveFile(
            path,
            shell.currentDirectoryId
        );

        if (!file) {
            return `tail: cannot open '${path}': No such file or directory`;
        }

        content = file.content;
    }

    return content.split("\n").slice(-lines).join("\n");
};

export default tail;
