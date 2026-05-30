/* eslint no-prototype-builtins: off */
/* Turn off rule, as object 'packageJson' has properties from Object.prototype.
   Rule details see https://eslint.org/docs/latest/rules/no-prototype-builtins
 */

import assert from 'node:assert';
import { afterEach, before, beforeEach, describe, it } from 'node:test';
import nock from 'nock';
import { config } from '../lib/config.js';
import { getPackageDataFromRepository } from '../lib/getPackageDataFromRepository.js';

/**
 * Fetching data from the (private) repository gets mocked to get independent from
 * varying data on the server and from having a real private repository.
 */

describe('getPackageDataFromRepository', () => {
  describe('getPackageDataFromRepository with default repository', { timeout: 20000 }, () => {
    let npmrc;
    let originalHttpRetryLimit;

    before(() => {
      npmrc = {
        defaultRegistry: config.registry,
      };
    });

    beforeEach(() => {
      originalHttpRetryLimit = config.httpRetryOptions.limit;
    });

    afterEach(() => {
      config.httpRetryOptions.limit = originalHttpRetryLimit;
      nock.cleanAll();
    });

    it('gets the information about the package "semver" from server with trailing slash', async () => {
      config.httpRetryOptions.limit = 1;
      const packageName = 'semver';

      // Mock the npm private repository response
      const scope = nock(npmrc.defaultRegistry, { encodedQueryParams: true })
        .get(`/${packageName}`)
        .reply(200, responses.semver);

      const packageJson = await getPackageDataFromRepository('semver', npmrc);

      assert.strictEqual(packageJson.name, packageName);
      assert.ok(Object.hasOwn(packageJson.versions, '7.3.7'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'], 'dist'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'].dist, 'tarball'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'], 'repository'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'].repository, 'url'));
      assert.ok(scope.isDone());
    });

    it('gets the information about the package "semver" from server without trailing slash', async () => {
      // Remove trailing slash
      npmrc.defaultRegistry = npmrc.defaultRegistry.slice(0, -1);
      config.httpRetryOptions.limit = 1;
      const packageName = 'semver';

      // Mock the npm private repository response
      const scope = nock(npmrc.defaultRegistry.concat('/'), {
        encodedQueryParams: true,
      })
        .get(`/${packageName}`)
        .reply(200, responses.semver);

      const packageJson = await getPackageDataFromRepository('semver', npmrc);

      assert.strictEqual(packageJson.name, packageName);
      assert.ok(Object.hasOwn(packageJson.versions, '7.3.7'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'], 'dist'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'].dist, 'tarball'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'], 'repository'));
      assert.ok(Object.hasOwn(packageJson.versions['7.3.7'].repository, 'url'));
      assert.ok(scope.isDone());
    });

    it('gets empty object for non existing package', async () => {
      const packageJson = await getPackageDataFromRepository('packagedoesnotexist', npmrc);
      assert.deepEqual(packageJson, {});
    });
  });

  describe('getPackageDataFromRepository with private repository', { timeout: 20000 }, () => {
    let originalConfigRegistry;
    let originalConfigNpmTokenEnvVar;
    let originalHttpRetryLimit;

    beforeEach(() => {
      originalConfigRegistry = config.registry;
      originalConfigNpmTokenEnvVar = config.npmTokenEnvVar;
      originalHttpRetryLimit = config.httpRetryOptions.limit;
    });

    afterEach(() => {
      config.registry = originalConfigRegistry;
      config.npmTokenEnvVar = originalConfigNpmTokenEnvVar;
      config.httpRetryOptions.limit = originalHttpRetryLimit;
      nock.cleanAll();
    });

    it('gets data from repository without authorization', async () => {
      const packageName = 'async';

      // Mock the config for accessing a npm private repository
      const npmRegistryHost = 'my.private.registry.com';
      const npmRegistry = `https://${npmRegistryHost}/`;
      const npmrc = {
        defaultRegistry: npmRegistry,
      };
      process.env.NPM_TOKEN = '';
      config.httpRetryOptions.limit = 1;

      // Mock the npm private repository response
      const scope = nock(npmRegistry, { encodedQueryParams: true })
        .get(`/${packageName}`)
        .reply(200, responses.async);

      const packageReportData = await getPackageDataFromRepository(packageName, npmrc);

      assert.strictEqual(packageReportData.name, packageName);
      assert.ok(Object.hasOwn(packageReportData.versions, '3.2.0'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'], 'dist'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'].dist, 'tarball'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'], 'repository'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'].repository, 'url'));
      if (!scope.isDone()) {
        console.error('pending mocks: %j', scope.pendingMocks());
      }
      assert.ok(scope.isDone());
    });

    it('gets data from repository with authorization', async () => {
      const packageName = 'async';

      // Mock the config for accessing a npm private repository
      const npmRegistryHost = 'my.private.registry.com';
      const npmRegistryUri = `//${npmRegistryHost}/`;
      const npmRegistry = `https://${npmRegistryHost}/`;
      const npmToken = 'pp6j6gzcge';
      const authToken = {};
      authToken[npmRegistryUri] = npmToken;
      const npmrc = {
        defaultRegistry: npmRegistry,
        authTokens: [authToken],
      };
      config.httpRetryOptions.limit = 1;

      // Mock the npm private repository response
      const scope = nock(npmRegistry, { encodedQueryParams: true })
        .matchHeader('host', npmRegistryHost)
        .matchHeader('authorization', `Bearer ${npmToken}`)
        .get(`/${packageName}`)
        .reply(200, responses.async);

      const packageReportData = await getPackageDataFromRepository('async', npmrc);

      assert.strictEqual(packageReportData.name, packageName);
      assert.ok(Object.hasOwn(packageReportData.versions, '3.2.0'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'], 'dist'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'].dist, 'tarball'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'], 'repository'));
      assert.ok(Object.hasOwn(packageReportData.versions['3.2.0'].repository, 'url'));
      assert.ok(scope.isDone());
    });

    it('throws error when using incorrect authorization', async () => {
      const packageName = 'async';

      // Mock the config for accessing a npm private repository
      const npmRegistryHost = 'my.private.registry.com';
      const npmRegistryUri = `//${npmRegistryHost}/`;
      const npmRegistry = `https://${npmRegistryHost}/`;
      const npmToken = 'pp6j6gzcge';
      const authToken = {};
      authToken[npmRegistryUri] = npmToken;
      const npmrc = {
        defaultRegistry: npmRegistry,
        authTokens: [authToken],
      };
      config.httpRetryOptions.limit = 1;

      // Mock the npm private repository response
      const scope = nock(npmRegistry, { encodedQueryParams: true })
        .matchHeader('host', npmRegistryHost)
        .matchHeader('authorization', `Bearer ${npmToken}`)
        .get(`/${packageName}`)
        .reply(401, {});

      try {
        await getPackageDataFromRepository('async', npmrc);
      } catch (error) {
        assert.strictEqual(error.name, 'HTTPError');
        assert.strictEqual(error.message, 'Response code 401 (Unauthorized)');
      } finally {
        if (!scope.isDone()) {
          console.error('pending mocks: %j', scope.pendingMocks());
        }
        assert.ok(scope.isDone());
      }
    });
  });
});

const responses = {
  async: {
    name: 'async',
    description: 'Higher-order functions and common patterns for asynchronous code',
    versions: {
      '3.2.0': {
        name: 'async',
        description: 'Higher-order functions and common patterns for asynchronous code',
        version: '3.2.0',
        repository: {
          type: 'git',
          url: 'git+https://github.com/caolan/async.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/async/-/async-3.2.0.tgz',
        },
      },
      '3.2.1': {
        name: 'async',
        description: 'Higher-order functions and common patterns for asynchronous code',
        version: '3.2.1',
        repository: {
          type: 'git',
          url: 'git+https://github.com/caolan/async.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/async/-/async-3.2.1.tgz',
        },
      },
    },
  },
  semver: {
    name: 'semver',
    description: 'The semantic version parser used by npm.',
    versions: {
      '7.3.6': {
        name: 'semver',
        version: '7.3.6',
        description: 'The semantic version parser used by npm.',
        repository: {
          type: 'git',
          url: 'git+https://github.com/npm/node-semver.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/semver/-/semver-7.3.6.tgz',
          fileCount: 51,
          unpackedSize: 87319,
        },
      },
      '7.3.7': {
        name: 'semver',
        version: '7.3.7',
        description: 'The semantic version parser used by npm.',
        repository: {
          type: 'git',
          url: 'git+https://github.com/npm/node-semver.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/semver/-/semver-7.3.7.tgz',
          fileCount: 51,
          unpackedSize: 87418,
        },
      },
    },
  },
};
