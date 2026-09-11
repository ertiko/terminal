import type { Command } from "../terminal/types.js";

const touch: Command = (args, _stdin, shell) => {
    if (shell.currentDirectoryId === null) {
        return "touch: cannot determine current directory";
    }

    if (shell.currentUser === null) {
        return "touch: no current user";
    }

    let noCreate = false;
    let endOfOptions = false;
    const files: string[] = [];

    for (const arg of args) {
        if (endOfOptions) {
            files.push(arg);
            continue;
        }

        if (arg === "--") {
            endOfOptions = true;
            continue;
        }

        if (arg === "-c" || arg === "--no-create") {
            noCreate = true;
            continue;
        }

        if (arg.startsWith("-")) {
            return `touch: invalid option '${arg}'`;
        }

        files.push(arg);
    }

    if (files.length === 0) {
        return "touch: missing file operand";
    }

    const errors: string[] = [];

    for (const name of files) {
        if (shell.fs.exists(shell.currentDirectoryId, name)) {
            errors.push(
                `touch: '${name}': File or directory already exists`
            );
            continue;
        }

        if (noCreate) {
            continue;
        }

        if (shell.fs.isBadName(name)) {
            errors.push(
                `touch: cannot touch '${name}': Invalid file name`
            );
            continue;
        }

        shell.fs.createFile(
            shell.currentDirectoryId,
            name,
            shell.currentUser.id,
            "",
            0o644
        );
    }

    return errors.join("\n");
};

export default touch;
