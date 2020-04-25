import test from 'ava';
import * as vb from '../src/ts/VersionBumper';

test('checkAccessToFile: when packageFile does not exist should return false', async t=>{
    t.false(await vb.checkAccessToFile("invalid file"));
})

test('checkAccessToFile: when packageFile does exist should return true', async t=>{
    t.true(await vb.checkAccessToFile("./package/package.json"));
})
