import type { Command } from "../terminal/types.js";
import { fsErrorMessages } from "../filesystem/errors.js";

const chown: Command = (args, _stdin, shell) => {
    if (args.length !== 2) {
        return "chown: usage: chown OWNER FILE";
    }

    if (shell.currentDirectoryId === null) {
        return "chown: cannot determine current directory";
    }

    const [owner, path] = args;

    if (owner === undefined || path === undefined) {
        return "chown: usage: chown OWNER FILE";
    }

    const ownerId = Number(owner);

    if (!Number.isInteger(ownerId) || ownerId < 0) {
        return `chown: invalid user '${owner}'`;
    }

    const parent = shell.paths.resolveParent(
        path,
        shell.currentDirectoryId
    );

    const name = shell.paths.getName(path);

    if (!parent || !name) {
        return `chown: cannot access '${path}': No such file or directory`;
    }

    const result = shell.fs.chown(
        parent.id,
        name,
        ownerId
    );

    if (!result.success) {
        return `chown: cannot access '${path}': ${fsErrorMessages[result.error.code]}`;
    }

    return "";
};

export default chown;
