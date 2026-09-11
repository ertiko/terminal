import type { Command } from "../terminal/types.js";

import { fsErrorMessages } from "../filesystem/errors.js";

const touch: Command = (args, _stdin, shell) => {
    if (shell.currentDirectoryId === null) {
        return "touch: cannot determine current directory";
    }

    if (shell.currentUser === null) {
        return "touch: no current user";
    }

    let noCreate = false;
    let endOfOptions = false;
    const paths: string[] = [];

    for (const arg of args) {
        if (endOfOptions) {
            paths.push(arg);
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

        paths.push(arg);
    }

    if (paths.length === 0) {
        return "touch: missing file operand";
    }

    const errors: string[] = [];

    for (const path of paths) {
        const existing = shell.paths.resolve(
            path,
            shell.currentDirectoryId
        );

        if (existing) {
            errors.push(
                `touch: '${path}': File or directory already exists`
            );
            continue;
        }

        if (noCreate) {
            continue;
        }

        const parent = shell.paths.resolveParent(
            path,
            shell.currentDirectoryId
        );

        const name = shell.paths.getName(path);

        if (!parent || !name) {
            errors.push(
                `touch: cannot touch '${path}': No such file or directory`
            );
            continue;
        }

        if (shell.fs.isBadName(name)) {
            errors.push(
                `touch: cannot touch '${path}': Invalid file name`
            );
            continue;
        }

        const createResult = shell.fs.createFile(
            parent.id,
            name,
            shell.currentUser.id,
            "",
            0o644
        );

        if (!createResult.success) {
            errors.push(
                `touch: cannot touch '${path}': ${fsErrorMessages[createResult.error.code]}`
            );
        }
    }

    return errors.join("\n");
};

export default touch;
