export function parseSemVer(semver:string) : Version {
    let version: Version = {} as Version;
    if (typeof(semver) !== "string") {
        throw new Error(ERR_ARG_NOT_A_STRING);
    }

    if (!REGEX_SEMVER.test(semver))
    {
        throw new Error(ERR_ARG_NOT_VALID_SEMVER);
    }
    let result = REGEX_SEMVER.exec(semver);
    if (!result)
    {
        throw new Error(ERR_UNABLE_TO_PARSE);
    }
    version.M = parseInt(result[1]);
    version.m = parseInt(result[2]);
    version.p = parseInt(result[3]);
    version.build = result[4];
    version.meta = result[5];

    return version;    
}

export function semVerToString(version: Version) : string {
    let result: string = `${version.M}.${version.m}.${version.p}`;
    if (version.build)
    {
        result += `-${version.build}`;
    }
    if (version.meta)
    {
        result += `+${version.meta}`;
    }
    return result;
}

export interface Version {
    meta?: string,
    build?: string,
    p: number,
    m: number,
    M: number
}

export enum SemVerParts {
    Meta,
    Build,
    Patch,
    Minor,
    Major
}

export const ERR_ARG_NOT_A_STRING = "Argument not valid. Expected a string.";
export const ERR_ARG_NOT_VALID_SEMVER = "Argument is not a valid SemVer";
export const ERR_UNABLE_TO_PARSE = "Unable to parse argument as a SemVer";
export const REGEX_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;