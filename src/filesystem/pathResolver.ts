import type { GameFileSystem } from "./index.js";
import type { FsNode, FileInterface, DirectoryInterface } from "./types.js";

export class PathResolver {
    private fs: GameFileSystem;

    constructor(fs: GameFileSystem) {
        this.fs = fs;
    }

    getStartDirectory(path: string, cwd: number): DirectoryInterface | undefined {
        if (path.startsWith("/")) {
            const result = this.fs.getRoot();
            return result.success ? result.value : undefined;   
        }

        const result = this.fs.getDirectoryById(cwd);
        return result.success ? result.value : undefined;
    }

    private walkDirectory(path: string, cwd: number): DirectoryInterface | undefined {
        let current = this.getStartDirectory(path, cwd);

        if (current === undefined) {
            return undefined;
        }

        for (const part of this.split(path)) {
            if (part === ".") {
                continue;
            }

            if (part === "..") {
                if (current.parent_id === null) {
                    continue;
                }

                const resultParent = this.fs.getDirectoryById(
                    current.parent_id
                );

                if (resultParent.success === false) {
                    return undefined;
                }

                current = resultParent.value;
                continue;
            }

            const resultDirectory = this.fs.getDirectory(
                current.id,
                part
            );

            if (resultDirectory.success === false) {
                return undefined;
            }

            current = resultDirectory.value;
        }

        return current;
    }

    private resolveNode(path: string, cwd: number): { parentId: number; name: string } | undefined {
        if (!path) {
            return undefined;
        }

        const parts = this.split(path);

        if (parts.length === 0) {
            return undefined;
        }

        const name = parts.pop();

        if (name === undefined) {
            return undefined;
        }

        const parentPath = path.startsWith("/")
            ? "/" + parts.join("/")
            : parts.join("/");

        const parent = this.walkDirectory(
            parentPath,
            cwd
        );

        if (parent === undefined) {
            return undefined;
        }

        return {
            parentId: parent.id,
            name
        };
    }

    resolve(path: string, cwd: number): FsNode | undefined {
        if (
            path === "." ||
            path === ".." ||
            path === "/"
        ) {
            return this.walkDirectory(path, cwd);
        }

        const node = this.resolveNode(path, cwd);

        if (node === undefined) {
            return undefined;
        }

        const fileResult = this.fs.getFile(node.parentId, node.name);
        const directoryResult = this.fs.getDirectory(node.parentId, node.name);

        return fileResult.success ? fileResult.value : directoryResult.success ? directoryResult.value : undefined;
    }

    resolveFile(path: string, cwd: number): FileInterface | undefined {
        const node = this.resolveNode(path, cwd);

        if (node === undefined) {
            return undefined;
        }

        const result = this.fs.getFile(node.parentId, node.name);
        return result.success ? result.value : undefined;
    }

    resolveDirectory(path: string, cwd: number): DirectoryInterface | undefined {
        return this.walkDirectory(path, cwd);
    }

    resolveParent(path: string, cwd: number): DirectoryInterface | undefined {
        const node = this.resolveNode(path, cwd);

        if (node === undefined) {
            return undefined;
        }

        const result = this.fs.getDirectoryById(node.parentId);
        return result.success ? result.value : undefined;
    }

    getName(path: string): string {
        const parts = path.split("/").filter(Boolean);

        if (parts.length === 0) {
            return "";
        }

        const name = parts[parts.length - 1];

        if (name === undefined) {
            return "";
        }

        return name;
    }

    split(path: string): string[] {
        return path.split("/").filter(Boolean);
    }
}
