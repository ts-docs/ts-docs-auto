
import { Generator, Utils } from "@ts-docs/ts-docs/dist/index";
import { TypescriptExtractor } from "@ts-docs/extractor";
import { workerData } from "worker_threads";
import path from "path";

const {entries, tsconfig, name, org, branchName} = workerData as {
    entries: Array<string>,
    tsconfig?: string,
    branchName?: string,
    name: string,
    org?: string
}

const extractor = new TypescriptExtractor({
    entryPoints: entries,
    tsconfig,
    externals: [Utils.handleDefaultAPI(), ...Utils.handleNodeAPI()],
    stripInternal: true,
    cwd: path.join(process.cwd(), "repos"),
    branchName
});

const projects = extractor.run();

const generator = new Generator({
    structure: "@ts-docs/default-docs-structure",
    landingPage: projects[0],
    entryPoints: entries,
    name,
    out: `./_/${org || ""}${name}`,
    exportMode: "detailed"
});

generator.generate(extractor, projects);

