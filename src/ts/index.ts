import VersionBumper from "./VersionBumper";
import { SemVerParts } from "./parseSemVer";

new VersionBumper().updateVersion().catch((r:any)=>{
    console.error(r);
    process.exit(500);
});