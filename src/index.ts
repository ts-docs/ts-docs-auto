
import { NpmFollower } from "./follower";
import { cloneRepo } from "./cloner";

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
            await cloneRepo(lastVersion);
        }
    }, 5000);
})();