import minimist from "minimist";
import { promises as fs, stat } from "fs";
import parseSemVer, { semVerToString, Version, SemVerParts, setBuildNumber } from "./parseSemVer";

export interface VersionBumperOptions {
    packageFilePath?: string,
    semVerPart?: SemVerParts,
    dontWrite?: boolean,
    build?: string,
    meta?: string,
    reset?: boolean
}

export default class VersionBumper {

    PackageFilePath: string;
    SemVerPart: SemVerParts;
    DontWrite: boolean;
    Reset: boolean;
    Build: string | null;
    Meta: string | null;

    constructor(options: VersionBumperOptions = {}) {
        this.PackageFilePath = options.packageFilePath ?? "./package.json";
        this.SemVerPart = options.semVerPart ?? SemVerParts.Patch;
        this.DontWrite = options.dontWrite ?? false;
        this.Build = options.build ?? null;
        this.Meta = options.meta ?? null;
        this.Reset = options.reset ?? false;
        this.parseArgs();
    }

    parseArgs() {
        let args = minimist(process.argv);
        this.PackageFilePath = args.packageFile ?? this.PackageFilePath;
        if (args.build) {
            this.Build = args.build;
        }
        if (args.meta) {
            this.Meta = args.meta;
        }
        if (args.b || args.buildNumber) {
            this.SemVerPart = SemVerParts.BuildNumber
        } else if (args.p || args.patch) {
            this.SemVerPart = SemVerParts.Patch
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
        let newVersion = bumpVersion(version, semVerPart, this.Reset);
        newVersion = setBuildAndOrMeta(newVersion, this.Build, this.Meta);
        packageJson.version = semVerToString(newVersion);
        if (!this.DontWrite) {
            await writeJsonObjectToFile(packageJson, this.PackageFilePath);
        }
        return newVersion;
    }
}

export function setBuildAndOrMeta(version: Version, build: string | undefined | null, meta: string | undefined | null = null): Version {
    let newVersion: Version = {} as Version;
    Object.assign(newVersion, version);
    if (build) {
        newVersion.build = build;
    }
    if (meta) {
        newVersion.meta = meta;
    }
    return newVersion;
}

export async function writeJsonObjectToFile(obj: any, path: string) {
    try {
        await fs.writeFile(path, JSON.stringify(obj, null, 2), { flag: "r+" });
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

export function bumpVersion(version: Version, semVerPart: SemVerParts,reset: boolean = false): Version {
    let newVersion: Version = {} as Version;
    Object.assign(newVersion, version);
    switch (semVerPart) {
        case SemVerParts.Major:
            newVersion.M = resetOrBump(reset, newVersion.M);
            newVersion.m = 0;
            newVersion.p = 0;
            if (newVersion.buildNumber)
            {
                newVersion = setBuildNumber(newVersion, 0);
            }
            break;
        case SemVerParts.Minor:
            newVersion.m = resetOrBump(reset, newVersion.m);
            newVersion.p = 0;
            if (newVersion.buildNumber)
            {
                newVersion = setBuildNumber(newVersion, 0);
            }
            break;
        case SemVerParts.Patch:
            newVersion.p = resetOrBump(reset, newVersion.p);
            if (newVersion.buildNumber)
            {
                newVersion = setBuildNumber(newVersion, 0);
            }
            break
        case SemVerParts.BuildNumber:
            if (newVersion.buildNumber)
                newVersion = setBuildNumber(newVersion, resetOrBump(reset, newVersion.buildNumber));
            else
                newVersion = setBuildNumber(newVersion, 0);
            break;
        default:
            break;
    }
    return newVersion;
}

function resetOrBump(reset: boolean, ver: number) : number{
    if (reset) return 0;
    ver++;
    return ver;
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