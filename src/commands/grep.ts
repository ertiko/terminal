import type { Command } from "../terminal/types.js";

const grep: Command = (args, stdin, shell) => {
    if (args.length === 0) {
        return "grep: missing pattern";
    }

    const pattern = args[0]!;

    let content = stdin;

    if (args.length > 1) {
        if (shell.currentDirectoryId === null) {
            return "grep: cannot determine current directory";
        }

        const file = shell.paths.resolveFile(
            args[1]!,
            shell.currentDirectoryId
        );

        if (!file) {
            return `grep: ${args[1]}: No such file or directory`;
        }

        content = file.content;
    }

    let regex: RegExp;

    try {
        regex = new RegExp(pattern);
    } catch {
        return `grep: invalid regular expression '${pattern}'`;
    }

    return content
        .split("\n")
        .filter(line => regex.test(line))
        .join("\n");
};

export default grep;
