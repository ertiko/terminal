import type { Command } from "../terminal/types.js";

const sort: Command = (args, stdin, shell) => {
    let content = stdin;

    if (args.length > 0) {
        if (shell.currentDirectoryId === null) {
            return "sort: cannot determine current directory";
        }

        const file = shell.paths.resolveFile(
            args[0]!,
            shell.currentDirectoryId
        );

        if (!file) {
            return `sort: cannot read '${args[0]}': No such file or directory`;
        }

        content = file.content;
    }

    return content
        .split("\n")
        .sort((a, b) => a.localeCompare(b))
        .join("\n");
};

export default sort;
