import type { Command } from "../terminal/types.js";

const cat: Command = (args, stdin, shell) => {
    if (args.length === 0) {
        return stdin;
    }

    if (shell.currentDirectoryId === null) {
        return "cat: cannot determine current directory";
    }

    const output: string[] = [];

    for (const name of args) {
        const file = shell.fs.getFile(
            shell.currentDirectoryId,
            name
        );

        if (file) {
            output.push(file.content);
            continue;
        }

        const directory = shell.fs.getDirectory(
            shell.currentDirectoryId,
            name
        );

        if (directory) {
            output.push(`cat: ${name}: Is a directory`);
            continue;
        }

        output.push(
            `cat: ${name}: No such file or directory`
        );
    }

    return output.join("\n");
};

export default cat;
