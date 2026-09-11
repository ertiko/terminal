import type { Command } from "../terminal/types.js";

import { fsErrorMessages } from "../filesystem/errors.js";

const mkdir: Command = (args, _stdin, shell) => {
    if (shell.currentUser === null) {
        return "mkdir: no current user";
    }

    if (shell.currentDirectoryId === null) {
        return "mkdir: cannot determine current directory";
    }

    let parents = false;
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

        if (arg === "-p" || arg === "--parents") {
            parents = true;
            continue;
        }

        if (arg.startsWith("-")) {
            return `mkdir: invalid option '${arg}'`;
        }

        paths.push(arg);
    }

    if (paths.length === 0) {
        return "mkdir: missing operand";
    }

    const errors: string[] = [];

    for (const path of paths) {
        if (!parents) {
            const existing = shell.paths.resolve(
                path,
                shell.currentDirectoryId
            );

            if (existing) {
                errors.push(
                    `mkdir: cannot create directory '${path}': File already exists`
                );
                continue;
            }

            const parent = shell.paths.resolveParent(
                path,
                shell.currentDirectoryId
            );

            const name = shell.paths.getName(path);

            if (!parent || !name) {
                errors.push(
                    `mkdir: cannot create directory '${path}': No such directory`
                );
                continue;
            }

            const resultCreate = shell.fs.createDirectory(
                parent.id,
                name,
                shell.currentUser.id,
                755
            );

            if (!resultCreate.success) {
                errors.push(
                    `mkdir: cannot create directory '${path}': ${fsErrorMessages[resultCreate.error.code]}`
                );
                continue;
            }

            continue;
        }   

        const parts = shell.paths.split(path);

        let current = shell.paths.getStartDirectory(path, shell.currentDirectoryId)

        if (!current) {
            errors.push(
                `mkdir: cannot create directory '${path}'`
            );
            continue;
        }

        for (const part of parts) {
            if (part === ".") {
                continue;
            }

            if (part === "..") {
                if (current.parent_id !== null) {
                    const parentResult =
                        shell.fs.getDirectoryById(
                            current.parent_id
                        );

                    if (!parentResult.success) {
                        errors.push(
                            `mkdir: cannot create directory '${path}'`
                        );
                        break;
                    }

                    current = parentResult.value;
                }

                continue;
            }

            const existingResult =
                shell.fs.getDirectory(
                    current.id,
                    part
                );

            if (existingResult.success) {
                current = existingResult.value;
                continue;
            }

            shell.fs.createDirectory(
                current.id,
                part,
                shell.currentUser.id,
                755
            );

            const createdResult =
                shell.fs.getDirectory(
                    current.id,
                    part
                );

            if (!createdResult.success) {
                errors.push(
                    `mkdir: cannot create directory '${path}'`
                );
                break;
            }

            current = createdResult.value;
        }
    }

    return errors.join("\n");
};

export default mkdir;
