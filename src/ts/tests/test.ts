import test from 'ava';
import VersionBumper, * as vb from '../VersionBumper';
import { SemVerParts, Version, parseSemVer, semVerToString } from '../parseSemVer';
import { promises as fs } from "fs";
const TEST_FILE_PATH: string = "./testPackage.json";

test('checkAccessToFile: when packageFile does not exist should return false', async t => {
    t.false(await vb.checkAccessToFile("invalid file"));
});

test('checkAccessToFile: when packageFile does exist should return true', async t => {
    t.true(await vb.checkAccessToFile("./package/package.json"));
});

test('bumpVersion: Should not modify original version', t => {
    let original = { M: 1, m: 2, p: 3 } as Version;
    vb.bumpVersion(original, SemVerParts.Major);
    vb.bumpVersion(original, SemVerParts.Minor);
    vb.bumpVersion(original, SemVerParts.Patch);
    t.deepEqual(original, { M: 1, m: 2, p: 3 });
});

test('bumpVersion: When major specified, Should increment major by one', t => {
    t.is(vb.bumpVersion({ M: 1 } as Version, SemVerParts.Major).M, 2);
});

test('bumpVersion: When minor specified, Should increment minor by one', t => {
    t.is(vb.bumpVersion({ m: 1 } as Version, SemVerParts.Minor).m, 2);
});

test('bumpVersion: When patch specified, Should increment patch by one', t => {
    t.is(vb.bumpVersion({ p: 1 } as Version, SemVerParts.Patch).p, 2);
});

test('getVersionFromPackage: When version not on object, should throw', t => {
    t.throws(() => vb.getVersionFromPackage({}));
});

test('getVersionFromPackage: When version not a string, should throw', t => {
    t.throws(() => vb.getVersionFromPackage({ version: 1 }));
});

test('getVersionFromPackage: When version is a string, should not throw', t => {
    t.notThrows(() => vb.getVersionFromPackage({ version: "string" }));
});

test.serial('updateVersion: Should actually update file', async t => {
    let ver: Version = { M: 1, m: 2, p: 3, build: "alpha", meta: "meta" };
    let testFilePath = TEST_FILE_PATH;
    await fs.writeFile(testFilePath, JSON.stringify( {version: semVerToString(ver)}, null, 2));
    await new VersionBumper(testFilePath).updateVersion();
    let verActual = parseSemVer(vb.getVersionFromPackage(await vb.getJSONObjectFromFile(testFilePath)));
    let verExpected = vb.bumpVersion(ver,SemVerParts.Patch);
    t.deepEqual(verActual, verExpected);
});
test.afterEach.always('updateVersion: Should actually update file', async ()=> {
    try {
        await fs.unlink(TEST_FILE_PATH);
    } catch {

    }
});

test.serial('updateVersion: When dontWrite set, Should not update file', async t => {
    let ver: Version = { M: 1, m: 2, p: 3, build: "alpha", meta: "meta" };
    let testFilePath = TEST_FILE_PATH;
    await fs.writeFile(testFilePath, JSON.stringify( {version: semVerToString(ver)}, null, 2));
    await new VersionBumper(testFilePath).updateVersion();
    let verActual = parseSemVer(vb.getVersionFromPackage(await vb.getJSONObjectFromFile(testFilePath)));
    let verExpected = vb.bumpVersion(ver,SemVerParts.Patch);
    t.deepEqual(verActual, verExpected);
});

test.afterEach.always('updateVersion: When dontWrite set, Should not update file', async ()=> {
    try {
        await fs.unlink(TEST_FILE_PATH);
    } catch {

    }
});