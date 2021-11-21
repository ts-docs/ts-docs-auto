
import { NpmFollower } from "./follower";

(async () => {
    const follower = new NpmFollower();
    await follower.init();
    console.log("Sleeping...");
    await follower.wait(10000);
    console.log("No longer sleeping!");
    setInterval(async () => {
        const obj = (await follower.get())[0];
        if (!obj) return;
        const allVersions = Object.values(obj.doc.versions);
        const lastVersion = allVersions[allVersions.length - 1];
        if (!lastVersion.dependencies || !lastVersion.dependencies.typescript) return;
        console.dir(lastVersion, {depth: 100});
    }, 5000);
})();