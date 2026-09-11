import type { Command } from "../terminal/types.js";

const wc: Command = (args, stdin, shell) => {
    let content = stdin;

    if (args.length > 0) {
        if (shell.currentDirectoryId === null) {
            return "wc: cannot determine current directory";
        }

        const file = shell.paths.resolveFile(
            args[0]!,
            shell.currentDirectoryId
        );

        if (!file) {
            return `wc: ${args[0]}: No such file or directory`;
        }

        content = file.content;
    }

    const lines = content.length === 0
        ? 0
        : content.split("\n").length;

    const words = content
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    const chars = content.length;

    return `${lines} ${words} ${chars}`;
};

export default wc;
