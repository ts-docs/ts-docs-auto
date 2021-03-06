
import { RegistryPackageVersion } from "./follower";
import got from "got";
import Zip from "adm-zip";

export function getPackageRepo({ repository }: RegistryPackageVersion): string | undefined {
    if (!repository) return;
    const repoStr = typeof repository === "string" ? repository : repository.url;
    if (!repoStr) return;
    const github = repoStr.indexOf("github.com/");
    if (github === -1) return;
    return repoStr.slice(github + 11).replace(/.git/g, "");
}

export async function cloneRepo(pkg: RegistryPackageVersion): Promise<{
    entries: Array<string>,
    tsconfig?: string,
    branchName: string
} | undefined> {
    const repo = getPackageRepo(pkg);
    if (!repo) return;
    let zipBuffer;
    try {
        zipBuffer = await got(`https://api.github.com/repos/${repo}/zipball`).buffer();
    } catch {
        return;
    }
    const mainBranch = (await got(`https://api.github.com/repos/${repo}`).json() as any).default_branch;
    const Zipper = new Zip(zipBuffer);
    let tsconfig;
    const entries: Array<string> = [];
    for (const entry of Zipper.getEntries()) {
        if (!tsconfig && entry.entryName.endsWith("tsconfig.json")) {
            Zipper.extractEntryTo(entry, "./repos");
            tsconfig = entry.entryName;
            continue;
        }
        if (entry.entryName.endsWith("README.md")) {
            Zipper.extractEntryTo(entry, "./repos");
            continue;
        }
        if (entry.entryName.endsWith("package.json")) {
            Zipper.extractEntryTo(entry, "./repos");
            continue;
        }
        if (!entry.isDirectory) continue;
        const rawName = entry.rawEntryName.toString("utf8");
        const sliced = rawName.slice(-4);
        if ((sliced === "lib/" && entries.length === 0) || sliced === "src/") {
            const joined = `${rawName}index.ts`;
            if (Zipper.getEntry(joined)) {
                entries.push(`${rawName}index.ts`);
                Zipper.extractEntryTo(entry, "./repos");
            }
        }
    }
    if (!entries.length) return;
    return {entries, branchName: mainBranch, tsconfig};
}