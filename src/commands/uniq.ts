import type { Command } from "../terminal/types.js";

const uniq: Command = (args, stdin, shell) => {
    let content = stdin;

    if (args.length > 0) {
        if (shell.currentDirectoryId === null) {
            return "uniq: cannot determine current directory";
        }

        const file = shell.paths.resolveFile(
            args[0]!,
            shell.currentDirectoryId
        );

        if (!file) {
            return `uniq: cannot read '${args[0]}': No such file or directory`;
        }

        content = file.content;
    }

    const lines = content.split("\n");
    const output: string[] = [];

    for (const line of lines) {
        if (output.length === 0 || output[output.length - 1] !== line) {
            output.push(line);
        }
    }

    return output.join("\n");
};

export default uniq;
