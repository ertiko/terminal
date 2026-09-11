import type { Command } from "../terminal/types.js";
import { fsErrorMessages } from "../filesystem/errors.js";

const cp: Command = (args, _stdin, shell) => {
    if (args.length !== 2) {
        return "cp: usage: cp SOURCE DEST";
    }

    if (shell.currentDirectoryId === null) {
        return "cp: cannot determine current directory";
    }

    const [source, destination] = args;

    if (source === undefined || destination === undefined) {
        return "cp: usage: cp SOURCE DEST";
    }

    const sourceFile = shell.paths.resolveFile(
        source,
        shell.currentDirectoryId
    );

    if (!sourceFile) {
        const sourceNode = shell.paths.resolve(
            source,
            shell.currentDirectoryId
        );

        if (sourceNode && !("content" in sourceNode)) {
            return `cp: -r not specified; omitting directory '${source}'`;
        }

        return `cp: cannot stat '${source}': No such file or directory`;
    }

    let parent;
    let name;

    const destinationNode = shell.paths.resolve(
        destination,
        shell.currentDirectoryId
    );

    if (destinationNode && !("content" in destinationNode)) {
        parent = destinationNode;
        name = sourceFile.name;
    } else {
        parent = shell.paths.resolveParent(
            destination,
            shell.currentDirectoryId
        );

        name = shell.paths.getName(destination);
    }

    if (!parent || !name) {
        return `cp: cannot create regular file '${destination}': No such file or directory`;
    }

    const result = shell.fs.createFile(
        parent.id,
        name,
        sourceFile.owner_id,
        sourceFile.content,
        sourceFile.permissions
    );

    if (!result.success) {
        return `cp: cannot create '${destination}': ${fsErrorMessages[result.error.code]}`;
    }

    return "";
};

export default cp;
