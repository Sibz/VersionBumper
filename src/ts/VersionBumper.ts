import minimist from "minimist";
import { promises as fs, stat } from "fs";
import parseSemVer, { Version, SemVerParts } from "./parseSemVer";

export default class VersionBumper {

    PackageFilePath: string;
    SemVerPart: SemVerParts;

    constructor() {
        this.PackageFilePath = "";
        this.SemVerPart = SemVerParts.Patch;
        this.parseArgs();
    }

    parseArgs() {
        let args = minimist(process.argv);
        this.PackageFilePath = args.packageFile ?? "./package.json";
        if (args.b || args.build) {
            this.SemVerPart = SemVerParts.Build
        } else if (args.m || args.minor) {
            this.SemVerPart = SemVerParts.Minor
        } else if (args.M || args.major) {
            this.SemVerPart = SemVerParts.Major
        }
    }

    async updateVersion(): Promise<Version> {
        if (!await checkAccessToFile(this.PackageFilePath)) {
            throw `Unable to access path: '${this.PackageFilePath}'`;
        }

        let packageJson: any = await getJSONObjectFromFile(this.PackageFilePath);
        let version: Version = parseSemVer(packageJson);

        return version;
    }
}

export function bumpVersion(version: Version, semVerPart: SemVerParts) : Version {
    let newVersion: Version = version;

    return newVersion;
}

export const ERRORS = {
    VERSION_NOT_FOUND: "Version field not found on object",
    VERSION_NOT_A_STRING: "Argument not valid. Expected a string",
    VERSION_NOT_VALID: "Passed string is not a valid SemVer",

};

export async function checkAccessToFile(path: string): Promise<Boolean> {
    try {
        await fs.access(path);
    } catch {
        return false;
    }
    return true;
}

export async function getJSONObjectFromFile(path: string): Promise<any> {
    try {
        return (await fs.readFile(path)).toJSON;
    } catch (e) {
        throw `Unable to read file '${path}' as json object.\n${e}`;
    }
}