import assert from 'node:assert';
import path from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import url from 'node:url';
import { addLocalPackageData } from '../lib/addLocalPackageData.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe('addLocalPackageData', () => {
  describe('addLocalPackageData with plain project', () => {
    let projectRootPath;
    const fields = [
      'relatedTo',
      'name',
      'licensePeriod',
      'material',
      'licenseType',
      'link',
      'definedVersion',
      'author',
    ];

    beforeEach(() => {
      projectRootPath = path
        .resolve(__dirname, 'fixture', 'add-local-data')
        .replace(/(\s+)/g, '\\$1');
    });

    it('adds package data for package', async () => {
      const depsIndexElement = {
        fullName: 'mypackage',
        alias: 'mypackage',
        name: 'mypackage',
        version: '~9.8.1',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '9.8.7');
    });

    it('adds package data for package with fixed version', async () => {
      const depsIndexElement = {
        fullName: 'myfixedpackage',
        alias: '',
        name: 'myfixedpackage',
        version: '5.6.7',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '5.6.7');
    });

    it('adds package data for scoped package', async () => {
      const depsIndexElement = {
        fullName: '@test/testpackage',
        alias: '@test/testpackage',
        name: 'testpackage',
        version: '^1.2.0',
        scope: '@test',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '1.2.3');
    });

    it('adds package data for local package', async () => {
      const depsIndexElement = {
        fullName: 'my-local-package',
        alias: 'my-local-package',
        name: 'my-local-package',
        version: 'file:local-libs/my-local-package',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '3.4.5');
    });

    it('gets versions with prebuild package', async () => {
      const depsIndexElement = {
        fullName: 'ol',
        alias: 'ol',
        name: 'ol',
        version: 'dev',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '6.5.1-dev.1622493276948');
    });

    it('gets versions with alias package', async () => {
      const depsIndexElement = {
        fullName: 'mocha',
        alias: 'my-mocha',
        name: 'mocha',
        version: '^8.3.1',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '8.3.1');
    });

    it('adds package data for not installed package', async () => {
      const depsIndexElement = {
        fullName: 'not-installed-package',
        alias: 'not-installed-package',
        name: 'not-installed-package',
        version: '~1.0.2',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, 'n/a');
    });

    it('adds package data for custom field', async () => {
      const depsIndexElement = {
        fullName: 'my-local-package',
        alias: 'my-local-package',
        name: 'my-local-package',
        version: 'file:local-libs/my-local-package',
      };
      const customFields = ['author', 'description'];
      await addLocalPackageData(depsIndexElement, projectRootPath, customFields);

      assert.ok(depsIndexElement.description);
      assert.strictEqual(depsIndexElement.description, 'A list of color names and its values');
    });

    it('adds package data for object property of custom field', async () => {
      const depsIndexElement = {
        fullName: 'my-local-package',
        alias: 'my-local-package',
        name: 'my-local-package',
        version: 'file:local-libs/my-local-package',
      };
      const customFields = ['author', 'repository'];
      await addLocalPackageData(depsIndexElement, projectRootPath, customFields);

      assert.ok(depsIndexElement.repository);
      assert.deepStrictEqual(depsIndexElement.repository, {
        type: 'git',
        url: 'git@github.com:colors/my-local-package.git',
      });
    });

    it('adds package data for nested property of custom field', async () => {
      const depsIndexElement = {
        fullName: 'my-local-package',
        alias: 'my-local-package',
        name: 'my-local-package',
        version: 'file:local-libs/my-local-package',
      };
      const customFields = ['name', 'repository.url'];
      await addLocalPackageData(depsIndexElement, projectRootPath, customFields);

      assert.ok(depsIndexElement['repository.url']);
      assert.strictEqual(
        depsIndexElement['repository.url'],
        'git@github.com:colors/my-local-package.git',
      );
    });
  });

  describe('addLocalPackageData with monorepo', () => {
    const fields = [
      'relatedTo',
      'name',
      'licensePeriod',
      'material',
      'licenseType',
      'link',
      'definedVersion',
      'author',
    ];

    it('adds package data for package in root level', async () => {
      const projectRootPath = path
        .resolve(__dirname, 'fixture', 'monorepo', 'sub-project', 'sub-sub-project')
        .replace(/(\s+)/g, '\\$1');

      const depsIndexElement = {
        fullName: 'lodash',
        alias: '',
        name: 'lodash',
        version: '^4.17.20',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '4.17.21');
    });

    it('adds package data for package with multiple versions', async () => {
      const projectRootPath = path
        .resolve(__dirname, 'fixture', 'monorepo', 'sub-project', 'sub-sub-project')
        .replace(/(\s+)/g, '\\$1');

      const depsIndexElement = {
        fullName: 'semver',
        alias: '',
        name: 'semver',
        version: '^7.5.4',
      };
      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.ok(depsIndexElement.installedVersion);
      assert.strictEqual(depsIndexElement.installedVersion, '7.5.4');
    });
  });

  describe('addLocalPackageData with custom fields', () => {
    let projectRootPath;

    beforeEach(() => {
      projectRootPath = path
        .resolve(__dirname, 'fixture', 'add-local-data')
        .replace(/(\s+)/g, '\\$1');
    });

    it('adds package data for default and custom fields', async () => {
      const fields = [
        'name',
        'material',
        'licenseType',
        'homepage',
        'definedVersion',
        'author',
        'bugs',
      ];

      const depsIndexElement = {
        fullName: '@kessler/tableify',
        alias: '',
        name: 'tableify',
        version: '^1.0.2',
        scope: '@kessler',
      };

      const expectedResult = {
        fullName: '@kessler/tableify',
        alias: '',
        name: 'tableify',
        version: '^1.0.2',
        scope: '@kessler',
        installedVersion: '1.0.2',
        author: 'Dan VerWeire, Yaniv Kessler',
        licenseType: 'MIT',
        homepage: 'https://github.com/kessler/node-tableify',
        bugs: {
          url: 'https://github.com/kessler/node-tableify/issues',
        },
      };

      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.deepStrictEqual(depsIndexElement, expectedResult);
    });

    it('adds package data for for nested custom field', async () => {
      const fields = ['name', 'repository', 'repository.url'];

      const depsIndexElement = {
        fullName: '@kessler/tableify',
        alias: '',
        name: 'tableify',
        version: '^1.0.2',
        scope: '@kessler',
      };

      const expectedResult = {
        fullName: '@kessler/tableify',
        alias: '',
        name: 'tableify',
        version: '^1.0.2',
        scope: '@kessler',
        installedVersion: '1.0.2',
        author: 'Dan VerWeire, Yaniv Kessler',
        licenseType: 'MIT',
        repository: {
          type: 'git',
          url: 'https://github.com/kessler/node-tableify.git',
        },
        'repository.url': 'https://github.com/kessler/node-tableify.git',
      };

      await addLocalPackageData(depsIndexElement, projectRootPath, fields);

      assert.deepStrictEqual(depsIndexElement, expectedResult);
    });
  });
});
