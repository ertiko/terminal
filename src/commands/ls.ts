import type { Command } from "../terminal/types.js";

const RESET = "\x1b[0m";
const BLUE = "\x1b[1;34m";
const GREEN = "\x1b[1;32m";

const ls: Command = (args, _stdin, shell) => {
    if (shell.currentDirectoryId === null) {
        return "ls: cannot determine current directory";
    }

    let showHidden = false;
    let useColor = true;
    const paths: string[] = [];

    for (const arg of args) {
        if (arg === "-a" || arg === "--all") {
            showHidden = true;
            continue;
        }

        if (arg === "--color=always") {
            useColor = true;
            continue;
        }

        if (arg === "--color=never") {
            useColor = false;
            continue;
        }

        if (arg === "--color=auto") {
            useColor = true;
            continue;
        }

        if (arg.startsWith("-")) {
            return `ls: invalid option '${arg}'`;
        }

        paths.push(arg);
    }

    if (paths.length === 0) {
        paths.push(".");
    }

    const output: string[] = [];

    for (const path of paths) {
        const target = shell.paths.resolve(
            path,
            shell.currentDirectoryId
        );

        if (!target) {
            output.push(
                `ls: cannot access '${path}': No such file or directory`
            );

            continue;
        }

        if ("content" in target) {
            let name = target.name;

            if (useColor && (target.permissions & 0o111) !== 0) {
                name = `${GREEN}${name}${RESET}`;
            }

            output.push(name);
            continue;
        }

        const listResult = shell.fs.listDirectory(target.id);

        if (!listResult.success) {
            continue;
        }

        const { directories, files } = listResult.value;

        const entries: string[] = [];

        for (const directory of directories) {
            if (
                !showHidden &&
                directory.name.startsWith(".")
            ) {
                continue;
            }

            const name = `${directory.name}/`;

            entries.push(
                useColor
                    ? `${BLUE}${name}${RESET}`
                    : name
            );
        }

        for (const file of files) {
            if (
                !showHidden &&
                file.name.startsWith(".")
            ) {
                continue;
            }

            let name = file.name;

            if (
                useColor &&
                (file.permissions & 0o111) !== 0
            ) {
                name = `${GREEN}${name}${RESET}`;
            }

            entries.push(name);
        }

        if (paths.length > 1) {
            output.push(`${path}:`);
        }

        output.push(entries.join("  "));
    }

    return output.join("\n");
};

export default ls;
