
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

export async function cloneRepo(pkg: RegistryPackageVersion): Promise<string | undefined> {
    const repo = getPackageRepo(pkg);
    if (!repo) return;
    let zipBuffer;
    try {
        zipBuffer = await got(`https://api.github.com/repos/${repo}/zipball`).buffer();
    } catch {
        return;
    }
    const Zipper = new Zip(zipBuffer);
    let srcPath;
    let pathToSrc;
    // Unintended consequence: "src" and "lib" folders are allowed inside other folders: for example "thing/src" will be found if there isn't a "src" folder in the parent directory
    for (const entry of Zipper.getEntries()) {
        if (!entry.isDirectory) continue;
        const rawName = entry.rawEntryName.toString("utf8");
        const sliced = rawName.slice(-4);
        if (sliced === "lib/" || sliced === "src/") {
            srcPath = entry;
            pathToSrc = rawName;
            break;
        }
    }
    if (!srcPath) return;
    Zipper.extractEntryTo(srcPath, "./repos");
    console.log(`./repos/${pathToSrc}`);
    return `./repos/${pathToSrc}`;
}