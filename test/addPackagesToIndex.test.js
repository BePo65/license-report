import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';
import { addPackagesToIndex } from '../lib/addPackagesToIndex.js';

describe('addPackagesToIndex', () => {
  let index;

  beforeEach(() => {
    index = [];
  });

  it('adds a package to the index', () => {
    addPackagesToIndex({ foo: '*' }, index);

    assert.deepStrictEqual(index, [
      {
        fullName: 'foo',
        name: 'foo',
        version: '*',
        scope: undefined,
        alias: '',
      },
    ]);
  });

  it('adds a scoped package to the index', () => {
    addPackagesToIndex({ '@bar/foo': '*' }, index);

    assert.deepStrictEqual(index, [
      {
        fullName: '@bar/foo',
        name: 'foo',
        version: '*',
        scope: 'bar',
        alias: '',
      },
    ]);
  });

  it('adds a local package to the index', () => {
    addPackagesToIndex({ 'my-local-package': 'file:local-libs/my-local-package' }, index);

    assert.deepStrictEqual(index, [
      {
        fullName: 'my-local-package',
        name: 'my-local-package',
        version: 'file:local-libs/my-local-package',
        scope: undefined,
        alias: '',
      },
    ]);
  });

  it('does not add duplicate packages, same package is a package that has the same name, version expression and scope', () => {
    addPackagesToIndex({ '@bar/foo': '*' }, index);
    addPackagesToIndex({ '@bar/foo': '*' }, index);
    addPackagesToIndex({ '@bar/foo': '1.2.3' }, index);
    addPackagesToIndex({ foo: '1.1.1' }, index);
    addPackagesToIndex({ foo: '1.1.1' }, index);
    addPackagesToIndex({ foo: '1.2.3' }, index);

    assert.deepStrictEqual(index, [
      {
        fullName: '@bar/foo',
        name: 'foo',
        version: '*',
        scope: 'bar',
        alias: '',
      },
      {
        fullName: '@bar/foo',
        name: 'foo',
        version: '1.2.3',
        scope: 'bar',
        alias: '',
      },
      {
        fullName: 'foo',
        name: 'foo',
        version: '1.1.1',
        scope: undefined,
        alias: '',
      },
      {
        fullName: 'foo',
        name: 'foo',
        version: '1.2.3',
        scope: undefined,
        alias: '',
      },
    ]);
  });

  it('does not add excluded package to the index - single word exclude', () => {
    const exclude = 'semver';
    addPackagesToIndex({ semver: '1.2.3' }, index, exclude);
    addPackagesToIndex(
      {
        '@bar/foo': '*',
        foo: '1.1.1',
      },
      index,
      exclude,
    );
    const expectedResult = [
      {
        fullName: '@bar/foo',
        name: 'foo',
        version: '*',
        scope: 'bar',
        alias: '',
      },
      {
        fullName: 'foo',
        name: 'foo',
        version: '1.1.1',
        scope: undefined,
        alias: '',
      },
    ];

    assert.deepStrictEqual(index, expectedResult);
  });

  it('does not add excluded package to the index - array of excludes', () => {
    const exclude = ['@bar/foo'];
    addPackagesToIndex({ '@bar/foo': '1.2.3' }, index, exclude);
    addPackagesToIndex(
      {
        '@bar/foo': '*',
        foo: '1.1.1',
      },
      index,
      exclude,
    );

    assert.deepStrictEqual(index, [
      {
        fullName: 'foo',
        name: 'foo',
        version: '1.1.1',
        scope: undefined,
        alias: '',
      },
    ]);
  });

  it('does not add excluded package to the index - excludeRegex', () => {
    const excludeRegexp = /@bar\/f.*/;
    addPackagesToIndex({ '@bar/foo': '1.2.3' }, index, undefined, excludeRegexp);
    addPackagesToIndex(
      {
        '@bar/foo': '*',
        foo: '1.1.1',
      },
      index,
      undefined,
      excludeRegexp,
    );

    assert.deepStrictEqual(index, [
      {
        fullName: 'foo',
        name: 'foo',
        version: '1.1.1',
        scope: undefined,
        alias: '',
      },
    ]);
  });

  it('add package with alias to the index', () => {
    addPackagesToIndex({ 'my-mocha': 'npm:mocha@^8.3.1' }, index);

    assert.deepStrictEqual(index, [
      {
        fullName: 'mocha',
        name: 'mocha',
        version: '^8.3.1',
        scope: undefined,
        alias: 'my-mocha',
      },
    ]);
  });

  it('add scoped package with alias to the index', () => {
    addPackagesToIndex({ '@kessler/tableify_1.0.1': 'npm:@kessler/tableify@^1.0.1' }, index);

    assert.deepStrictEqual(index, [
      {
        fullName: '@kessler/tableify',
        name: 'tableify',
        version: '^1.0.1',
        scope: 'kessler',
        alias: '@kessler/tableify_1.0.1',
      },
    ]);
  });
});
