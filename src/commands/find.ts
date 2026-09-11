import type { Command } from "../terminal/types.js";

const find: Command = (args, _stdin, shell) => {
    if (shell.currentDirectoryId === null) {
        return "find: cannot determine current directory";
    }

    let startPath = ".";
    let nameFilter: string | undefined;

    if (args.length > 0) {
        startPath = args[0]!;

        if (args.length === 3 && args[1] === "-name") {
            nameFilter = args[2];
        } else if (args.length !== 1) {
            return "find: invalid expression";
        }
    }

    const start = shell.paths.resolve(
        startPath,
        shell.currentDirectoryId
    );

    if (!start) {
        return `find: '${startPath}': No such file or directory`;
    }

    const output: string[] = [];

    const walk = (node: typeof start, path: string): void => {
        if (
            nameFilter === undefined ||
            node.name === nameFilter
        ) {
            output.push(path);
        }

        if ("content" in node) {
            return;
        }

        const result = shell.fs.listDirectory(node.id);

        if (!result.success) {
            return;
        }

        for (const directory of result.value.directories) {
            const childPath =
                path === "/"
                    ? `/${directory.name}`
                    : `${path}/${directory.name}`;

            walk(directory, childPath);
        }

        for (const file of result.value.files) {
            const childPath =
                path === "/"
                    ? `/${file.name}`
                    : `${path}/${file.name}`;

            walk(file, childPath);
        }
    };

    walk(start, startPath === "." ? "." : startPath);

    return output.join("\n");
};

export default find;
