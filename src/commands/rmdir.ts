import type { Command } from "../terminal/types.js";
import { fsErrorMessages } from "../filesystem/errors.js";

const rmdir: Command = (args, _stdin, shell) => {
    if (args.length === 0) {
        return "rmdir: missing operand";
    }

    const errors: string[] = [];

    for (const path of args) {
        if (path.startsWith("-")) {
            return `rmdir: invalid option '${path}'`;
        }

        if (shell.currentDirectoryId === null) {
            return "rmdir: cannot determine current directory";
        }

        const parent = shell.paths.resolveParent(
            path,
            shell.currentDirectoryId
        );

        const name = shell.paths.getName(path);

        if (!parent || !name) {
            errors.push(
                `rmdir: failed to remove '${path}': No such directory`
            );
            continue;
        }

        const result = shell.fs.deleteDirectory(
            parent.id,
            name
        );

        if (!result.success) {
            errors.push(
                `rmdir: failed to remove '${path}': ${fsErrorMessages[result.error.code]}`
            );
        }
    }

    return errors.join("\n");
};

export default rmdir;
