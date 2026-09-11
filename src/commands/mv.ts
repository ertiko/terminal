import type { Command } from "../terminal/types.js";
import { fsErrorMessages } from "../filesystem/errors.js";

const mv: Command = (args, _stdin, shell) => {
    if (args.length !== 2) {
        return "mv: usage: mv SOURCE DEST";
    }

    if (shell.currentDirectoryId === null) {
        return "mv: cannot determine current directory";
    }

    const [source, destination] = args;

    if (source === undefined || destination === undefined) {
        return "mv: usage: mv SOURCE DEST";
    }

    const sourceNode = shell.paths.resolve(
        source,
        shell.currentDirectoryId
    );

    if (!sourceNode) {
        return `mv: cannot stat '${source}': No such file or directory`;
    }

    const destinationNode = shell.paths.resolve(
        destination,
        shell.currentDirectoryId
    );

    let newParent;
    let newName;

    if (destinationNode && !("content" in destinationNode)) {
        newParent = destinationNode;

        newName = sourceNode.name;
    } else {
        newParent = shell.paths.resolveParent(
            destination,
            shell.currentDirectoryId
        );

        newName = shell.paths.getName(destination);

        if (!newParent || !newName) {
            return `mv: cannot move '${source}' to '${destination}': No such file or directory`;
        }
    }

    const sourceParent = shell.paths.resolveParent(
        source,
        shell.currentDirectoryId
    );

    const sourceName = shell.paths.getName(source);

    if (!sourceParent || !sourceName) {
        return `mv: cannot move '${source}'`;
    }

    const result = shell.fs.move(
        sourceParent.id,
        sourceName,
        newParent.id,
        newName
    );

    if (!result.success) {
        return `mv: cannot move '${source}' to '${destination}': ${fsErrorMessages[result.error.code]}`;
    }

    return "";
};

export default mv;
