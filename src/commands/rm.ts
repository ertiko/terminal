import type { Command } from "../terminal/types.js";
import { fsErrorMessages } from "../filesystem/errors.js";

const rm: Command = (args, _stdin, shell) => {
    if (args.length === 0) {
        return "rm: missing operand";
    }

    let recursive = false;
    let force = false;
    const paths: string[] = [];

    for (const arg of args) {
        if (arg === "-r" || arg === "--recursive") {
            recursive = true;
            continue;
        }

        if (arg === "-f" || arg === "--force") {
            force = true;
            continue;
        }

        if (arg.startsWith("-")) {
            return `rm: invalid option '${arg}'`;
        }

        paths.push(arg);
    }

    const errors: string[] = [];

    for (const path of paths) {
        if (shell.currentDirectoryId === null) {
            return "rm: cannot determine current directory";
        }

        const target = shell.paths.resolve(
            path,
            shell.currentDirectoryId
        );

        if (!target) {
            if (!force) {
                errors.push(
                    `rm: cannot remove '${path}': No such file or directory`
                );
            }

            continue;
        }

        const parent = shell.paths.resolveParent(
            path,
            shell.currentDirectoryId
        );

        const name = shell.paths.getName(path);

        if (!parent || !name) {
            errors.push(
                `rm: cannot remove '${path}': Invalid path`
            );
            continue;
        }

        if (!("content" in target) && !recursive) {
            errors.push(
                `rm: cannot remove '${path}': Is a directory`
            );
            continue;
        }

        if ("content" in target) {
            const result = shell.fs.deleteFile(
                parent.id,
                name
            );

            if (!result.success) {
                errors.push(
                    `rm: cannot remove '${path}': ${fsErrorMessages[result.error.code]}`
                );
            }

            continue;
        }

        const result = shell.fs.deleteDirectory(
            parent.id,
            name,
            recursive
        );

        if (!result.success) {
            errors.push(
                `rm: cannot remove '${path}': ${fsErrorMessages[result.error.code]}`
            );
        }
    }

    return errors.join("\n");
};

export default rm;
