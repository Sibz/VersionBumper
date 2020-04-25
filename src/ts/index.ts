import VersionBumper from "./VersionBumper";

new VersionBumper().updateVersion().catch(r=>{
    console.error(r);
    process.exit(500);
});