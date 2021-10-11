
import { NpmFollower } from "./follower";

(async () => {
    const follower = new NpmFollower();
    await follower.init();
    console.log("Sleeping...");
    await follower.wait(10000);
    console.log("No longer sleeping!");
    setInterval(async () => {
        console.log(await follower.get());
    }, 1000);
})();