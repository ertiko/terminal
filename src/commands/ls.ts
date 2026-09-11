import type { Command } from "../terminal/types.js";

const RESET = "\x1b[0m";
const BLUE = "\x1b[1;34m";
const GREEN = "\x1b[1;32m";
const CYAN = "\x1b[1;36m";

const ls: Command = (args, _stdin, shell) => {
    if (shell.currentDirectoryId === null) {
        return "ls: cannot determine current directory";
    }

    let showHidden = false;
    let useColor = true;

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

        return `ls: cannot access '${arg}': No such file or directory`;
    }

    const { directories, files } = shell.fs.listDirectory(
        shell.currentDirectoryId
    );

    const output: string[] = [];

    for (const directory of directories) {
        if (!showHidden && directory.name.startsWith(".")) {
            continue;
        }

        const name = `${directory.name}/`;

        output.push(
            useColor
                ? `${BLUE}${name}${RESET}`
                : name
        );
    }

    for (const file of files) {
        if (!showHidden && file.name.startsWith(".")) {
            continue;
        }

        const executable = (file.permissions & 0o111) !== 0;

        let name = file.name;

        if (useColor) {
            if (executable) {
                name = `${GREEN}${name}${RESET}`;
            }
        }

        output.push(name);
    }

    return output.join("  ");
};

export default ls;
