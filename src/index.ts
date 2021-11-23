
import { NpmFollower } from "./follower";
import { cloneRepo } from "./cloner";
import { Worker } from "worker_threads";

(async () => {
    const follower = new NpmFollower();
    await follower.init();
    setInterval(async () => {
        for (const obj of (await follower.get())) {
            if (!obj || !obj.doc || !obj.doc.versions) return;
            const allVersions = Object.values(obj.doc.versions);
            const lastVersion = allVersions[allVersions.length - 1];
            if (!lastVersion.devDependencies || !lastVersion.devDependencies.typescript) return;
            if (!lastVersion.main || !lastVersion.main.endsWith("index.js")) return;
            const repoInfo = await cloneRepo(lastVersion);
            if (!repoInfo) return;
            let packageName, packageOrg;
            const firstSlashIndex = lastVersion.name.indexOf("/");
            if (firstSlashIndex === -1) packageName = lastVersion.name;
            else {
                packageName = lastVersion.name.slice(1, firstSlashIndex);
                packageOrg = lastVersion.name.slice(firstSlashIndex);
            }
            new Worker(`${__dirname}/generator.js`, {
                workerData: { ...repoInfo, name: packageName, org: packageOrg }
            });
        }
    }, 5000);
})();