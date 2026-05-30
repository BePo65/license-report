// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import assert from 'node:assert';
import path from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import url from 'node:url';
import { getDependencies } from '../lib/getDependencies.js';
import { readJson } from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageJsonPath = path
  .resolve(__dirname, 'fixture', 'default-fields', 'package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for test using package.json with empty dependencies
const emptyDepsPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencies', 'empty-dependency-package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for test using package.json with no dependencies
const noDepsPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencies', 'no-dependency-package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for test using package.json with multiple dependencies
const multiDepsPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencies', 'multi-deps-package.json')
  .replace(/(\s+)/g, '\\$1');

describe('getDependencies', () => {
  let packageJson;

  beforeEach(async () => {
    packageJson = await readJson(packageJsonPath);
  });

  it('adds all dependency types to output (no "depsType" parameter)', () => {
    const exclusions = [];
    const depsIndex = getDependencies(packageJson, exclusions);

    assert.strictEqual(depsIndex.length, 4);
  });

  it('adds all dependency types to output (empty "depsType" parameter)', () => {
    const exclusions = [];
    const depsIndex = getDependencies(packageJson, exclusions, []);

    assert.strictEqual(depsIndex.length, 4);
  });

  it('adds dependencies to output', () => {
    const exclusions = [];
    const depsIndex = getDependencies(packageJson, exclusions, ['prod']);

    assert.strictEqual(depsIndex.length, 1);
    assert.strictEqual(depsIndex[0].fullName, '@kessler/tableify');
  });

  it('adds optionalDependencies to output', () => {
    const exclusions = [];
    const depsIndex = getDependencies(packageJson, exclusions, ['opt']);

    assert.strictEqual(depsIndex.length, 1);
    assert.strictEqual(depsIndex[0].fullName, 'semver');
  });

  it('adds dependencies and optionalDependencies to output', () => {
    const exclusions = [];
    const depsIndex = getDependencies(packageJson, exclusions, ['prod', 'opt']);

    assert.strictEqual(depsIndex.length, 2);
    assert.strictEqual(depsIndex[0].fullName, '@kessler/tableify');
    assert.strictEqual(depsIndex[1].fullName, 'semver');
  });

  it('adds peerDependencies to output', () => {
    const exclusions = [];
    const depsIndex = getDependencies(packageJson, exclusions, ['peer']);

    assert.strictEqual(depsIndex.length, 1);
    assert.strictEqual(depsIndex[0].fullName, 'lodash');
  });

  it('adds dependencies to output for empty dependencies property', async () => {
    const exclusions = [];
    packageJson = await readJson(emptyDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, exclusions);

    assert.strictEqual(depsIndex.length, 0);
  });

  it('adds all dependencies to output for missing dependencies properties', async () => {
    const exclusions = [];
    packageJson = await readJson(noDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, exclusions);

    assert.strictEqual(depsIndex.length, 0);
  });

  it('adds multiple dependencies to output', async () => {
    const exclusions = [];
    packageJson = await readJson(multiDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, exclusions);

    assert.strictEqual(depsIndex.length, 6);
  });

  it('adds multiple dependencies to output with single word exclude', async () => {
    const exclusion = 'tablemark';
    packageJson = await readJson(multiDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, exclusion);

    assert.strictEqual(depsIndex.length, 5);
  });

  it('adds multiple dependencies to output with array of excludes', async () => {
    const exclusions = ['tablemark', 'text-table'];
    packageJson = await readJson(multiDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, exclusions);

    assert.strictEqual(depsIndex.length, 4);
  });

  it('adds multiple dependencies to output with excludeRegex', async () => {
    const exclusionRegex = /^@commitlint\/.*/i;
    packageJson = await readJson(multiDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, undefined, undefined, exclusionRegex);

    assert.strictEqual(depsIndex.length, 4);
  });

  it('adds multiple dependencies to output with single word exclude and excludeRegex', async () => {
    const exclusion = 'tablemark';
    const exclusionRegex = /^@commitlint\/.*/i;
    packageJson = await readJson(multiDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, exclusion, undefined, exclusionRegex);

    assert.strictEqual(depsIndex.length, 3);
  });

  it('adds multiple dependencies to output with array of excludes and excludeRegex', async () => {
    const exclusions = ['tablemark', 'text-table'];
    const exclusionRegex = /^@commitlint\/.*/i;
    packageJson = await readJson(multiDepsPackageJsonPath);
    const depsIndex = getDependencies(packageJson, exclusions, undefined, exclusionRegex);

    assert.strictEqual(depsIndex.length, 2);
  });
});
