import minimist from "minimist";
import { promises as fs, stat } from "fs";

enum SemVerParts {
    Build,
    Patch,
    Minor,
    Major
}

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

    async updateVersion() {
        if (!await checkAccessToFile(this.PackageFilePath)) {
            throw `Unable to access path: '${this.PackageFilePath}'`;
        }

        let packageJson: any = await getJSONObjectFromFile(this.PackageFilePath);
        let version: Version = getVersionFromPackageJsonObject(packageJson);

    }
}

export function bumpVersion(version: Version, semVerPart: SemVerParts) : Version {
    let newVersion: Version = version;

    return newVersion;
}

export function getVersionFromPackageJsonObject(obj: any): Version {
    let version: Version = {} as Version;
    if (!obj.version) {
        throw "Version field not found on object";
    }
    if (typeof (obj.version) !== "string") {
        throw "Version field not a string";
    }
    let versionArray = (obj.version as String).split(".");
    if (versionArray.length < 3) {
        throw "Version field must contain at least 3 semver parts (i.e. '1.2.3')";
    }
    try {
        if (versionArray.length == 4) {
            version.b = parseInt(versionArray[3]);
        }
        version.p = parseInt(versionArray[2]);
        version.m = parseInt(versionArray[1]);
        version.M = parseInt(versionArray[0]);
    } catch {
        throw "VersionBumper only supports integer version parts.";
    }
    return version;
}

export interface Version {
    b?: number,
    p: number,
    m: number,
    M: number
}

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