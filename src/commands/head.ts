import type { Command } from "../terminal/types.js";

const head: Command = (args, stdin, shell) => {
    let lines = 10;
    let path: string | undefined;

    if (args[0]?.startsWith("-")) {
        const value = Number(args[0].slice(1));

        if (!Number.isInteger(value) || value < 0) {
            return `head: invalid number of lines: '${args[0]}'`;
        }

        lines = value;
        path = args[1];
    } else {
        path = args[0];
    }

    let content = stdin;

    if (path !== undefined) {
        if (shell.currentDirectoryId === null) {
            return "head: cannot determine current directory";
        }

        const file = shell.paths.resolveFile(
            path,
            shell.currentDirectoryId
        );

        if (!file) {
            return `head: cannot open '${path}': No such file or directory`;
        }

        content = file.content;
    }

    return content.split("\n").slice(0, lines).join("\n");
};

export default head;
