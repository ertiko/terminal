import type { Command } from "../terminal/types.js";

const tree: Command = (args, _stdin, shell) => {
    if (shell.currentDirectoryId === null) {
        return "tree: cannot determine current directory";
    }

    const path = args[0] ?? ".";

    const root = shell.paths.resolve(
        path,
        shell.currentDirectoryId
    );

    if (!root) {
        return `tree: '${path}': No such file or directory`;
    }

    if ("content" in root) {
        return root.name;
    }

    const output: string[] = [root.name === "/" ? "/" : root.name];

    const walk = (
        directoryId: number,
        prefix: string
    ): void => {
        const result = shell.fs.listDirectory(directoryId);

        if (!result.success) {
            return;
        }

        const entries = [
            ...result.value.directories.map(directory => ({
                name: directory.name,
                directory: true,
                node: directory
            })),
            ...result.value.files.map(file => ({
                name: file.name,
                directory: false,
                node: file
            }))
        ];

        entries.forEach((entry, index) => {
            const last = index === entries.length - 1;
            const branch = last ? "└── " : "├── ";

            output.push(
                prefix + branch + (
                    entry.directory
                        ? `${entry.name}/`
                        : entry.name
                )
            );

            if (entry.directory) {
                walk(
                    entry.node.id,
                    prefix + (last ? "    " : "│   ")
                );
            }
        });
    };

    walk(root.id, "");

    return output.join("\n");
};

export default tree;
