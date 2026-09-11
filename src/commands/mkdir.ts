import type { Command } from "../terminal/types.js";

const mkdir: Command = (args, _stdin, shell) => {
    let parents = false;
    const paths: string[] = [];

    for (const arg of args) {
        switch (arg) {
            case "-p":
            case "--parents":
                parents = true;
                break;

            case "--":
                paths.push(...args.slice(args.indexOf(arg) + 1));
                break;

            default:
                if (arg.startsWith("-")) {
                    return `mkdir: invalid option '${arg}'`;
                }

                paths.push(arg);
        }
    }

    if (paths.length === 0) {
        return "mkdir: missing operand";
    }

    if (shell.currentUser === null) {
        return "mkdir: no current user";
    }

    if (shell.currentDirectoryId === null) {
        return "mkdir: cannot determine current directory";
    }

    for (const path of paths) {
        const parts = path.split("/").filter(Boolean);

        let parentId: number | undefined = path.startsWith("/")
            ? shell.fs.getRoot()?.id
            : shell.currentDirectoryId;

        if (parentId === undefined) {
            return "mkdir: cannot determine current directory";
        }

        for (let i = 0; i < parts.length; i++) {
            const name = parts[i];

            if (name === undefined) {
                continue;
            }

            const last = i === parts.length - 1;

            const existing = shell.fs.getDirectory(parentId, name);

            if (existing) {
                if (last && !parents) {
                    return `mkdir: cannot create directory '${path}': File exists`;
                }

                parentId = existing.id;
                continue;
            }

            if (!last && !parents) {
                return `mkdir: cannot create directory '${path}': No such file or directory`;
            }

            shell.fs.createDirectory(
                parentId,
                name,
                shell.currentUser.id,
                755
            );

            const created = shell.fs.getDirectory(parentId, name);

            if (!created) {
                return `mkdir: cannot create directory '${path}'`;
            }

            parentId = created.id;
        }

    }

    return "";
};

export default mkdir;
