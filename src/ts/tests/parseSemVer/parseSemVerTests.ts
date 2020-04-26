import test from 'ava';
import parseSemVer, * as psv from '../../parseSemVer';
import { pbkdf2Sync } from 'crypto';


test('When not valid sem ver, should throw', t=> {
    var err = t.throws(()=>parseSemVer("invalid.semver"));
    t.is(err.message, psv.ERR_ARG_NOT_VALID_SEMVER);
});

test('When valid sem ver, should not throw', t=> {
    t.notThrows(()=>parseSemVer("1.0.0"));    
});

test('When valid 3 part semver, should get version', t => {
    let version = parseSemVer("1.2.3");
    let expected = { M: 1, m: 2, p: 3, build: undefined, meta: undefined} as psv.Version;
    t.deepEqual(version,expected);
});

test('When valid 3 part semver with build, should get version', t => {
    let version = parseSemVer("1.2.3-alpha");
    let expected = { M: 1, m: 2, p: 3, build: "alpha", meta: undefined} as psv.Version;
    t.deepEqual(version,expected);
});

test('When valid 3 part semver with meta, should get version', t => {
    let version = parseSemVer("1.2.3+test");
    let expected = { M: 1, m: 2, p: 3, build: undefined, meta: "test"} as psv.Version;
    t.deepEqual(version,expected);
});

test('When valid 3 part semver with build and meta, should get version', t => {
    let version = parseSemVer("1.2.3-beta+test");
    let expected = { M: 1, m: 2, p: 3, build: "beta", meta: "test"} as psv.Version;
    t.deepEqual(version,expected);
});

test('When valid 3 part semver with build, build number and meta, should get version', t => {
    let version = parseSemVer("1.2.3-beta.123+test");
    let expected = { M: 1, m: 2, p: 3, build: "beta.123", buildNumber:123, meta: "test"} as psv.Version;
    t.deepEqual(version,expected);
});

test('ToString: When 3 part should form valid string', t=> {
    t.is(psv.semVerToString({M:1,m:2,p:3} as psv.Version), "1.2.3");
});

test('ToString: When 3 part with build should form valid string', t=> {
    t.is(psv.semVerToString({M:1,m:2,p:3, build:"alpha"} as psv.Version), "1.2.3-alpha");
});

test('ToString: When 3 part with build and build number should form valid string', t=> {
    t.is(psv.semVerToString({M:1,m:2,p:3, build:"alpha", buildNumber: 123} as psv.Version), "1.2.3-alpha.123");
});

test('ToString: When 3 part with build and new build number should form valid string with new build number', t=> {
    t.is(psv.semVerToString({M:1,m:2,p:3, build:"alpha.123", buildNumber: 256} as psv.Version), "1.2.3-alpha.256");
});

test('ToString: When 3 part with build and build number should only update last number in build', t=> {
    t.is(psv.semVerToString({M:1,m:2,p:3, build:"alpha.111.222.123", buildNumber: 256} as psv.Version), "1.2.3-alpha.111.222.256");
});

test('ToString: When 3 part with meta should form valid string', t=> {
    t.is(psv.semVerToString({M:1,m:2,p:3, meta:"meta"} as psv.Version), "1.2.3+meta");
});

test('ToString: When 3 part with build and meta should form valid string', t=> {
    t.is(psv.semVerToString({M:1,m:2,p:3, build:"alpha", meta:"meta"} as psv.Version), "1.2.3-alpha+meta");
});