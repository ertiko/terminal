import type { Command } from "../terminal/types.js";
import { fsErrorMessages } from "../filesystem/errors.js";

const chmod: Command = (args, _stdin, shell) => {
    if (args.length !== 2) {
        return "chmod: usage: chmod MODE FILE";
    }

    if (shell.currentDirectoryId === null) {
        return "chmod: cannot determine current directory";
    }

    const [mode, path] = args;

    if (mode === undefined || path === undefined) {
        return "chmod: usage: chmod MODE FILE";
    }

    const permissions = Number.parseInt(mode, 8);

    if (
        Number.isNaN(permissions) ||
        permissions < 0 ||
        permissions > 0o777
    ) {
        return `chmod: invalid mode '${mode}'`;
    }

    const parent = shell.paths.resolveParent(
        path,
        shell.currentDirectoryId
    );

    const name = shell.paths.getName(path);

    if (!parent || !name) {
        return `chmod: cannot access '${path}': No such file or directory`;
    }

    const result = shell.fs.chmod(
        parent.id,
        name,
        permissions
    );

    if (!result.success) {
        return `chmod: cannot access '${path}': ${fsErrorMessages[result.error.code]}`;
    }

    return "";
};

export default chmod;
