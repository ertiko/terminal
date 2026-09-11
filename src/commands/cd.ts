import type { Command } from "../terminal/types.js";

const cd: Command = (args, _stdin, shell) => {
    if (args.length > 1) {
        return "cd: too many arguments";
    }

    if (args.length === 0) {
        return "cd: missing argument";
    }

    if (shell.currentDirectoryId === null) {
        return "cd: cannot determine current directory";
    }

    const path = args[0]!;

    const directory = shell.paths.resolveDirectory(path, shell.currentDirectoryId);

    if (directory === undefined) {
        return "cd: directory not found";
    }

    shell.currentDirectoryId = directory.id;

    return "";
};

export default cd;
