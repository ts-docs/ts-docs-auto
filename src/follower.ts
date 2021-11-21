import got from "got";

export interface RegistryPackage {
    [key: string] : unknown;
    doc: {
        versions: Record<string, {
            dependencies: Record<string, string>
        }>
    },
    id: string,
    repository?: string
}

export interface RegistryInfo {
    last_seq: number,
    results: Array<RegistryPackage>
}

export class NpmFollower {
    seq: number
    lastSeq: number
    constructor() {
        this.seq = 0;
        this.lastSeq = 0;
    }

    async init() {
        const req = await got("https://replicate.npmjs.com/_changes?since=now").json() as RegistryInfo;
        this.seq = req.last_seq;
    }

    async get(limit = 50) : Promise<Array<RegistryPackage>> {
        const res = await got(`https://replicate.npmjs.com/_changes?since=${this.seq}&include_docs=true&limit=${limit}`).json() as RegistryInfo;
        this.seq += res.results.length;
        this.lastSeq = res.last_seq;
        return res.results;
    }
    
    wait(ms = 1000) : Promise<void> {
        return new Promise(res => setTimeout(res, ms));
    }
}

