import minimist from "minimist";
import { promises as fs, stat } from "fs";
import parseSemVer, { semVerToString, Version, SemVerParts } from "./parseSemVer";

export default class VersionBumper {

    PackageFilePath: string;
    SemVerPart: SemVerParts;
    DontWrite: Boolean;

    constructor(packageFilePath: string = "./package.json", semVerPart: SemVerParts = SemVerParts.Patch, dontWrite:Boolean = false) {
        this.PackageFilePath = packageFilePath;
        this.SemVerPart = semVerPart;
        this.DontWrite = dontWrite;
        this.parseArgs();
    }

    parseArgs() {
        let args = minimist(process.argv);
        this.PackageFilePath = args.packageFile ?? this.PackageFilePath;
        if (args.b || args.build) {
            this.SemVerPart = SemVerParts.Build
        } else if (args.m || args.minor) {
            this.SemVerPart = SemVerParts.Minor
        } else if (args.M || args.major) {
            this.SemVerPart = SemVerParts.Major
        }
        if (!this.DontWrite && (args.f || args.dontWrite)) {
            this.DontWrite = true;
        }
    }

    async updateVersion(semVerPart: SemVerParts | null = null): Promise<Version> {
        semVerPart = semVerPart ?? this.SemVerPart;
        if (!await checkAccessToFile(this.PackageFilePath)) {
            throw `Unable to access path: '${this.PackageFilePath}'`;
        }

        let packageJson: any = await getJSONObjectFromFile(this.PackageFilePath);
        let versionString = getVersionFromPackage(packageJson);
        let version: Version = parseSemVer(versionString);
        let newVersion = bumpVersion(version, semVerPart);
        packageJson.version = semVerToString(newVersion);
        if (!this.DontWrite)
        {
            await writeJsonObjectToFile(packageJson, this.PackageFilePath);
        }   
        return newVersion;
    }
}

export async function writeJsonObjectToFile(obj: any, path: string) {
    try {
        await fs.writeFile(path, JSON.stringify(obj, null, 2), { flag: "r+"});
    } catch {
        throw new Error("Was unable to write json to file");
    }
}

export function getVersionFromPackage(obj: any): string {
    if (!obj.version) {
        throw new Error("Version does not exist on object or is null");
    }
    if (typeof (obj.version) !== "string") {
        throw new Error("Version field should be a string");
    }
    return obj.version;
}

export function bumpVersion(version: Version, semVerPart: SemVerParts): Version {
    let newVersion: Version = {} as Version;
    Object.assign(newVersion, version);
    switch (semVerPart) {
        case SemVerParts.Major:
            newVersion.M++;
            break;
        case SemVerParts.Minor:
            newVersion.m++;
            break;
        case SemVerParts.Patch:
            newVersion.p++;
        default:
            break;
    }
    return newVersion;
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
        return JSON.parse((await fs.readFile(path)).toString());
    } catch (e) {
        throw `Unable to read file '${path}' as json object.\n${e}`;
    }
}