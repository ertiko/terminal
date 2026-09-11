import type { Command } from "../terminal/types.js";

const cd: Command = (args, _stdin, shell) => {
    if (args.length > 1) {
        return "cd: too many arguments";
    }

    if (shell.currentDirectoryId === null) {
        return "cd: cannot determine current directory";
    }

    const path = args[0];

    if (path === undefined || path === "~") {
        const root = shell.fs.getRoot();

        if (!root) {
            return "cd: cannot find root directory";
        }

        shell.currentDirectoryId = root.id;
        return "";
    }

    if (path === "/") {
        const root = shell.fs.getRoot();

        if (!root) {
            return "cd: cannot find root directory";
        }

        shell.currentDirectoryId = root.id;
        return "";
    }

    if (path === ".") {
        return "";
    }

    if (path === "..") {
        const current = shell.fs.getDirectoryById(
            shell.currentDirectoryId
        );

        if (!current) {
            return "cd: current directory does not exist";
        }

        if (current.parent_id !== null) {
            shell.currentDirectoryId = current.parent_id;
        }

        return "";
    }

    const directory = shell.fs.getDirectory(
        shell.currentDirectoryId,
        path
    );

    if (!directory) {
        return `cd: ${path}: No such file or directory`;
    }

    shell.currentDirectoryId = directory.id;

    return "";
};

export default cd;
