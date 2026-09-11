import type { Command } from "../terminal/types.js";

const stat: Command = (args, _stdin, shell) => {
    if (args.length === 0) {
        return "stat: missing operand";
    }

    if (shell.currentDirectoryId === null) {
        return "stat: cannot determine current directory";
    }

    const output: string[] = [];

    for (const path of args) {
        const target = shell.paths.resolve(
            path,
            shell.currentDirectoryId
        );

        if (!target) {
            output.push(
                `stat: cannot stat '${path}': No such file or directory`
            );
            continue;
        }

        const type = "content" in target
            ? "file"
            : "directory";

        output.push(
            `  File: ${path}`,
            `  Type: ${type}`,
            `  ID: ${target.id}`,
            `  Owner: ${target.owner_id}`,
            `  Permissions: ${target.permissions.toString(8).padStart(3, "0")}`
        );
    }

    return output.join("\n");
};

export default stat;
