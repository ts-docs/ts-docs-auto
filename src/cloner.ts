
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

export async function cloneRepo(pkg: RegistryPackageVersion): Promise<Array<string> | undefined> {
    const repo = getPackageRepo(pkg);
    if (!repo) return;
    let zipBuffer;
    try {
        zipBuffer = await got(`https://api.github.com/repos/${repo}/zipball`).buffer();
    } catch {
        return;
    }
    const Zipper = new Zip(zipBuffer);
    let tsconfig = false;
    const entries: Array<string> = [];
    for (const entry of Zipper.getEntries()) {
        if (!tsconfig && entry.entryName.includes("tsconfig")) {
            Zipper.extractEntryTo(entry, "./repos");
            tsconfig = true;
            continue;
        }
        if (!entry.isDirectory) continue;
        const rawName = entry.rawEntryName.toString("utf8");
        const sliced = rawName.slice(-4);
        if ((sliced === "lib/" && entries.length === 0) || sliced === "src/") {
            entries.push(rawName);
            Zipper.extractEntryTo(entry, "./repos");
        }
    }
    if (!entries.length) return;
    return entries;
}