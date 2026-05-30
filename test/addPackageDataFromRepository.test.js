import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import nock from 'nock';
import { addPackageDataFromRepository } from '../lib/addPackageDataFromRepository.js';
import { config } from '../lib/config.js';

/**
 * Fetching data from the repository gets mocked to get independent from
 * the latest data on the repository.
 */

const npmConfig = {
  defaultRegistry: config.registry,
};

describe('addPackageDataFromRepository', { timeout: 20000 }, () => {
  let originalHttpRetryLimit;

  beforeEach(() => {
    originalHttpRetryLimit = config.httpRetryOptions.limit;
  });

  afterEach(() => {
    config.httpRetryOptions.limit = originalHttpRetryLimit;
    nock.cleanAll();
  });

  it('gets the package report data for package', async () => {
    const packageEntry = {
      fullName: 'async',
      name: 'async',
      version: '^3.1.1',
      installedVersion: '3.2.0',
      licenseType: 'MIT',
      author: 'Caolan McMahon',
    };

    // Mock the npm repository response
    config.httpRetryOptions.limit = 1;
    const scope = nock(npmConfig.defaultRegistry, { encodedQueryParams: true })
      .get(`/${packageEntry.fullName}`)
      .reply(200, responses[packageEntry.fullName]);

    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'async');
    assert.strictEqual(packageReportData.link, 'git+https://github.com/caolan/async.git');
    assert.strictEqual(
      packageReportData.installedFrom,
      'https://registry.npmjs.org/async/-/async-3.2.0.tgz',
    );
    assert.strictEqual(packageReportData.remoteVersion, '3.2.2');
    assert.strictEqual(packageReportData.latestRemoteVersion, '3.2.4');
    assert.strictEqual(packageReportData.latestRemoteModified, '2022-07-25T16:10:41.997Z');
    assert.ok(scope.isDone());
  });

  it('gets the scoped package report data', async () => {
    const packageEntry = {
      fullName: '@kessler/tableify',
      name: 'tableify',
      version: '^1.0.1',
      scope: 'kessler',
      alias: '@kessler/tableify_1.0.1',
      installedVersion: '1.0.2',
      licenseType: 'MIT',
      author: 'Dan VerWeire, Yaniv Kessler',
    };

    // Mock the npm repository response
    config.httpRetryOptions.limit = 1;
    const scope = nock(npmConfig.defaultRegistry, { encodedQueryParams: true })
      .get(`/${packageEntry.fullName}`)
      .reply(200, responses[packageEntry.fullName]);

    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, '@kessler/tableify');
    assert.strictEqual(packageReportData.link, 'git+https://github.com/kessler/node-tableify.git');
    assert.strictEqual(
      packageReportData.installedFrom,
      'https://registry.npmjs.org/@kessler/tableify/-/tableify-1.0.2.tgz',
    );
    assert.strictEqual(packageReportData.remoteVersion, '1.0.2');
    assert.strictEqual(packageReportData.latestRemoteVersion, '1.0.2');
    assert.strictEqual(packageReportData.latestRemoteModified, '2022-04-05T23:26:35.798Z');
    assert.ok(scope.isDone());
  });

  it('returns message in remoteVersion when version is invalid', async () => {
    const packageEntry = {
      fullName: 'async',
      name: 'async',
      version: 'a.b.c',
      installedVersion: '3.2.0',
      licenseType: 'MIT',
      author: 'Caolan McMahon',
    };

    // Mock the npm repository response
    config.httpRetryOptions.limit = 1;
    const scope = nock(npmConfig.defaultRegistry, { encodedQueryParams: true })
      .get(`/${packageEntry.fullName}`)
      .reply(200, responses[packageEntry.fullName]);

    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'async');
    assert.strictEqual(packageReportData.link, 'n/a');
    assert.strictEqual(
      packageReportData.installedFrom,
      'https://registry.npmjs.org/async/-/async-3.2.0.tgz',
    );
    assert.strictEqual(
      packageReportData.remoteVersion,
      "no matching version found in registry for package 'async@a.b.c'",
    );
    assert.strictEqual(packageReportData.latestRemoteVersion, '3.2.4');
    assert.strictEqual(packageReportData.latestRemoteModified, '2022-07-25T16:10:41.997Z');
    assert.ok(scope.isDone());
  });

  it('returns message in remoteVersion when version does not exist on repository', async () => {
    const packageEntry = {
      fullName: 'async',
      name: 'async',
      version: '0.0.1',
      installedVersion: '3.2.0',
      licenseType: 'MIT',
      author: 'Caolan McMahon',
    };

    // Mock the npm repository response
    config.httpRetryOptions.limit = 1;
    const scope = nock(npmConfig.defaultRegistry, { encodedQueryParams: true })
      .get(`/${packageEntry.fullName}`)
      .reply(200, responses[packageEntry.fullName]);

    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'async');
    assert.strictEqual(packageReportData.link, 'n/a');
    assert.strictEqual(
      packageReportData.installedFrom,
      'https://registry.npmjs.org/async/-/async-3.2.0.tgz',
    );
    assert.strictEqual(
      packageReportData.remoteVersion,
      "no matching version found in registry for package 'async@0.0.1'",
    );
    assert.strictEqual(packageReportData.latestRemoteVersion, '3.2.4');
    assert.strictEqual(packageReportData.latestRemoteModified, '2022-07-25T16:10:41.997Z');
    assert.ok(scope.isDone());
  });

  it('gets report data for package with prebuild version', async () => {
    const packageEntry = {
      fullName: 'ol',
      name: 'ol',
      version: 'dev',
      installedVersion: '6.5.1-dev.1622493276948',
      licenseType: 'BSD-2-Clause',
      author: 'n/a',
    };

    // Mock the npm repository response
    config.httpRetryOptions.limit = 1;
    const scope = nock(npmConfig.defaultRegistry, { encodedQueryParams: true })
      .get(`/${packageEntry.fullName}`)
      .reply(200, responses[packageEntry.fullName]);

    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'ol');
    assert.strictEqual(packageReportData.link, 'git://github.com/openlayers/openlayers.git');
    assert.strictEqual(
      packageReportData.installedFrom,
      'https://registry.npmjs.org/ol/-/ol-6.5.1-dev.1622493276948.tgz',
    );
    assert.strictEqual(packageReportData.remoteVersion, '6.14.2-dev.1656800207214');
    assert.strictEqual(packageReportData.latestRemoteVersion, '6.14.1');
    assert.strictEqual(packageReportData.latestRemoteModified, '2022-07-30T22:00:12.715Z');
    assert.ok(scope.isDone());
  });

  it('gets report data for package with nightly version', async () => {
    const packageEntry = {
      fullName: '@parcel/optimizer-cssnano',
      name: 'optimizer-cssnano',
      scope: 'parcel',
      version: 'nightly',
      installedVersion: '2.0.0-nightly.662',
      licenseType: 'MIT',
      author: 'n/a',
    };

    // Mock the npm repository response
    config.httpRetryOptions.limit = 1;
    const scope = nock(npmConfig.defaultRegistry, { encodedQueryParams: true })
      .get(`/${packageEntry.fullName}`)
      .reply(200, responses[packageEntry.fullName]);

    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, '@parcel/optimizer-cssnano');
    assert.strictEqual(packageReportData.link, 'git+https://github.com/parcel-bundler/parcel.git');
    assert.strictEqual(
      packageReportData.installedFrom,
      'https://registry.npmjs.org/@parcel/optimizer-cssnano/-/optimizer-cssnano-2.0.0-nightly.662.tgz',
    );
    assert.strictEqual(packageReportData.remoteVersion, '2.0.0-nightly.1135');
    assert.strictEqual(packageReportData.latestRemoteVersion, '2.6.2');
    assert.strictEqual(packageReportData.latestRemoteModified, '2022-07-28T00:41:39.714Z');
    assert.ok(scope.isDone());
  });

  it('gets report data for package with alias name', async () => {
    const packageEntry = {
      fullName: 'mocha',
      name: 'mocha',
      version: '^8.3.1',
      alias: 'mocha_8.3.1',
      installedVersion: '8.3.1',
      licenseType: 'MIT',
      author: 'TJ Holowaychuk tj@vision-media.ca',
    };

    // Mock the npm repository response
    config.httpRetryOptions.limit = 1;
    const scope = nock(npmConfig.defaultRegistry, { encodedQueryParams: true })
      .get(`/${packageEntry.fullName}`)
      .reply(200, responses[packageEntry.fullName]);

    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'mocha');
    assert.strictEqual(packageReportData.link, 'git+https://github.com/mochajs/mocha.git');
    assert.strictEqual(
      packageReportData.installedFrom,
      'https://registry.npmjs.org/mocha/-/mocha-8.3.1.tgz',
    );
    assert.strictEqual(packageReportData.remoteVersion, '8.4.0');
    assert.strictEqual(packageReportData.latestRemoteVersion, '10.0.0');
    assert.strictEqual(packageReportData.latestRemoteModified, '2022-06-20T01:14:43.542Z');
    assert.ok(scope.isDone());
  });

  it('gets report data for local package using "file:"', async () => {
    const packageEntry = {
      fullName: 'my-local-package',
      name: 'my-local-package',
      version: 'file:local-libs/my-local-package',
      alias: '',
      installedVersion: '1.2.3',
      licenseType: 'n/a',
      author: 'n/a',
    };
    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'my-local-package');
    assert.strictEqual(packageReportData.link, 'n/a');
    assert.strictEqual(packageReportData.installedFrom, 'file:local-libs/my-local-package');
    assert.strictEqual(packageReportData.remoteVersion, 'n/a');
    assert.strictEqual(packageReportData.latestRemoteVersion, 'n/a');
    assert.strictEqual(packageReportData.latestRemoteModified, 'n/a');
  });

  it('gets report data for local package using "git:"', async () => {
    const packageEntry = {
      fullName: 'debug',
      name: 'debug',
      version: 'git://github.com/debug-js/debug.git',
      alias: '',
      installedVersion: '3.4.5',
      licenseType: 'n/a',
      author: 'n/a',
    };
    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'debug');
    assert.strictEqual(packageReportData.link, 'n/a');
    assert.strictEqual(packageReportData.installedFrom, 'git://github.com/debug-js/debug.git');
    assert.strictEqual(packageReportData.remoteVersion, 'n/a');
    assert.strictEqual(packageReportData.latestRemoteVersion, 'n/a');
    assert.strictEqual(packageReportData.latestRemoteModified, 'n/a');
  });

  it('gets report data for local package using "github:"', async () => {
    const packageEntry = {
      fullName: 'async',
      name: 'async',
      version: 'github:caolan/async',
      alias: '',
      installedVersion: '5.6.7',
      licenseType: 'n/a',
      author: 'n/a',
    };
    const packageReportData = await addPackageDataFromRepository(packageEntry, npmConfig);

    assert.strictEqual(packageReportData.name, 'async');
    assert.strictEqual(packageReportData.link, 'n/a');
    assert.strictEqual(packageReportData.installedFrom, 'github:caolan/async');
    assert.strictEqual(packageReportData.remoteVersion, 'n/a');
    assert.strictEqual(packageReportData.latestRemoteVersion, 'n/a');
    assert.strictEqual(packageReportData.latestRemoteModified, 'n/a');
  });
});

const responses = {
  async: {
    name: 'async',
    description: 'Higher-order functions and common patterns for asynchronous code',
    'dist-tags': {
      latest: '3.2.4',
      next: '3.1.0',
    },
    versions: {
      '3.1.1': {
        name: 'async',
        description: 'Higher-order functions and common patterns for asynchronous code',
        version: '3.1.1',
        repository: {
          type: 'git',
          url: 'git+https://github.com/caolan/async.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/async/-/async-3.1.1.tgz',
        },
      },
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
      '3.2.2': {
        name: 'async',
        description: 'Higher-order functions and common patterns for asynchronous code',
        version: '3.2.2',
        repository: {
          type: 'git',
          url: 'git+https://github.com/caolan/async.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/async/-/async-3.2.2.tgz',
        },
      },
    },
    time: {
      modified: '2022-07-25T16:10:41.997Z',
      created: '2010-12-19T16:41:51.765Z',
      '1.0.0': '2015-05-20T23:40:05.710Z',
    },
  },
  '@kessler/tableify': {
    name: '@kessler/tableify',
    time: {
      created: '2020-10-09T17:34:28.751Z',
      modified: '2022-04-05T23:26:35.798Z',
      '1.0.0': '2020-10-09T17:34:28.868Z',
      '1.0.1': '2020-10-09T17:38:36.597Z',
      '1.0.2': '2020-10-09T17:40:12.994Z',
    },
    'dist-tags': {
      latest: '1.0.2',
    },
    versions: {
      '1.0.0': {
        name: '@kessler/tableify',
        private: false,
        version: '1.0.0',
        description: 'Create HTML tables from Javascript Objects',
        repository: {
          type: 'git',
          url: 'git+https://github.com/wankdanker/node-tableify.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/@kessler/tableify/-/tableify-1.0.0.tgz',
          fileCount: 8,
          unpackedSize: 13396,
        },
      },
      '1.0.1': {
        name: '@kessler/tableify',
        private: false,
        version: '1.0.1',
        description: 'Create HTML tables from Javascript Objects',
        repository: {
          type: 'git',
          url: 'git+https://github.com/kessler/node-tableify.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/@kessler/tableify/-/tableify-1.0.1.tgz',
          fileCount: 8,
          unpackedSize: 13387,
        },
      },
      '1.0.2': {
        name: '@kessler/tableify',
        private: false,
        version: '1.0.2',
        description: 'Create HTML tables from Javascript Objects',
        repository: {
          type: 'git',
          url: 'git+https://github.com/kessler/node-tableify.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/@kessler/tableify/-/tableify-1.0.2.tgz',
          fileCount: 8,
          unpackedSize: 13353,
        },
      },
    },
  },
  ol: {
    name: 'ol',
    description: 'OpenLayers mapping library',
    time: {
      modified: '2022-07-30T22:00:12.715Z',
      created: '2014-10-01T04:57:41.727Z',
      '3.1.0-pre.1': '2014-10-01T04:57:41.727Z',
    },
    'dist-tags': {
      latest: '6.14.1',
      dev: '6.14.2-dev.1656800207214',
    },
    versions: {
      '6.5.1-dev.1622493276948': {
        name: 'ol',
        version: '6.5.1-dev.1622493276948',
        description: 'OpenLayers mapping library',
        repository: {
          type: 'git',
          url: 'git://github.com/openlayers/openlayers.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/ol/-/ol-6.5.1-dev.1622493276948.tgz',
          fileCount: 993,
          unpackedSize: 7033249,
        },
      },
      '6.14.1': {
        name: 'ol',
        version: '6.14.1',
        description: 'OpenLayers mapping library',
        repository: {
          type: 'git',
          url: 'git://github.com/openlayers/openlayers.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/ol/-/ol-6.14.1.tgz',
          fileCount: 1706,
          unpackedSize: 9323815,
        },
      },
      '6.14.2-dev.1656620100371': {
        name: 'ol',
        version: '6.14.2-dev.1656620100371',
        description: 'OpenLayers mapping library',
        repository: {
          type: 'git',
          url: 'git://github.com/openlayers/openlayers.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/ol/-/ol-6.14.2-dev.1656620100371.tgz',
          fileCount: 1711,
          unpackedSize: 9395612,
        },
      },
      '6.14.2-dev.1656692026667': {
        name: 'ol',
        version: '6.14.2-dev.1656692026667',
        description: 'OpenLayers mapping library',
        repository: {
          type: 'git',
          url: 'git://github.com/openlayers/openlayers.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/ol/-/ol-6.14.2-dev.1656692026667.tgz',
          fileCount: 1711,
          unpackedSize: 9395909,
        },
      },
      '6.14.2-dev.1656800207214': {
        name: 'ol',
        version: '6.14.2-dev.1656800207214',
        description: 'OpenLayers mapping library',
        repository: {
          type: 'git',
          url: 'git://github.com/openlayers/openlayers.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/ol/-/ol-6.14.2-dev.1656800207214.tgz',
          fileCount: 1711,
          unpackedSize: 9397424,
        },
      },
    },
  },
  '@parcel/optimizer-cssnano': {
    name: '@parcel/optimizer-cssnano',
    time: {
      created: '2019-08-13T15:30:40.581Z',
      '2.0.0-alpha.1': '2019-08-13T15:30:40.804Z',
      modified: '2022-07-28T00:41:39.714Z',
      '2.0.0-alpha.1.1': '2019-08-13T15:49:23.139Z',
    },
    'dist-tags': {
      latest: '2.6.2',
      nightly: '2.0.0-nightly.1135',
    },
    versions: {
      '2.6.2': {
        name: '@parcel/optimizer-cssnano',
        version: '2.6.2',
        repository: {
          type: 'git',
          url: 'git+https://github.com/parcel-bundler/parcel.git',
        },
        dist: {
          tarball:
            'https://registry.npmjs.org/@parcel/optimizer-cssnano/-/optimizer-cssnano-2.6.2.tgz',
          fileCount: 4,
          unpackedSize: 6475,
        },
      },
      '2.0.0-nightly.662': {
        name: '@parcel/optimizer-cssnano',
        version: '2.0.0-nightly.662',
        repository: {
          type: 'git',
          url: 'git+https://github.com/parcel-bundler/parcel.git',
        },
        dist: {
          tarball:
            'https://registry.npmjs.org/@parcel/optimizer-cssnano/-/optimizer-cssnano-2.0.0-nightly.662.tgz',
          fileCount: 4,
          unpackedSize: 5313,
        },
      },
      '2.0.0-nightly.1134': {
        name: '@parcel/optimizer-cssnano',
        version: '2.0.0-nightly.1134',
        repository: {
          type: 'git',
          url: 'git+https://github.com/parcel-bundler/parcel.git',
        },
        dist: {
          tarball:
            'https://registry.npmjs.org/@parcel/optimizer-cssnano/-/optimizer-cssnano-2.0.0-nightly.1134.tgz',
          fileCount: 4,
          unpackedSize: 6543,
        },
      },
      '2.0.0-nightly.1135': {
        name: '@parcel/optimizer-cssnano',
        version: '2.0.0-nightly.1135',
        repository: {
          type: 'git',
          url: 'git+https://github.com/parcel-bundler/parcel.git',
        },
        dist: {
          tarball:
            'https://registry.npmjs.org/@parcel/optimizer-cssnano/-/optimizer-cssnano-2.0.0-nightly.1135.tgz',
          fileCount: 4,
          unpackedSize: 6543,
        },
      },
    },
  },
  mocha: {
    name: 'mocha',
    description: 'simple, flexible, fun test framework',
    time: {
      modified: '2022-06-20T01:14:43.542Z',
      created: '2011-11-08T23:08:55.982Z',
      '0.0.1-alpha1': '2011-11-08T23:08:57.384Z',
    },
    'dist-tags': {
      latest: '10.0.0',
      esm: '7.0.0-esm1',
      'latest-6': '6.2.3',
    },
    versions: {
      '2.6.2': {
        name: '@parcel/optimizer-cssnano',
        version: '2.6.2',
        repository: {
          type: 'git',
          url: 'git+https://github.com/parcel-bundler/parcel.git',
        },
        dist: {
          tarball:
            'https://registry.npmjs.org/@parcel/optimizer-cssnano/-/optimizer-cssnano-2.6.2.tgz',
          fileCount: 4,
          unpackedSize: 6475,
        },
      },
      '8.3.0': {
        name: 'mocha',
        version: '8.3.0',
        description: 'simple, flexible, fun test framework',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mochajs/mocha.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/mocha/-/mocha-8.3.0.tgz',
          fileCount: 75,
          unpackedSize: 3072252,
        },
      },
      '8.3.1': {
        name: 'mocha',
        version: '8.3.1',
        description: 'simple, flexible, fun test framework',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mochajs/mocha.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/mocha/-/mocha-8.3.1.tgz',
          fileCount: 75,
          unpackedSize: 3071677,
        },
      },
      '8.3.2': {
        name: 'mocha',
        version: '8.3.2',
        description: 'simple, flexible, fun test framework',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mochajs/mocha.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/mocha/-/mocha-8.3.2.tgz',
          fileCount: 75,
          unpackedSize: 3072626,
        },
      },
      '8.4.0': {
        name: 'mocha',
        version: '8.4.0',
        description: 'simple, flexible, fun test framework',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mochajs/mocha.git',
        },
        dist: {
          tarball: 'https://registry.npmjs.org/mocha/-/mocha-8.4.0.tgz',
          fileCount: 75,
          unpackedSize: 3069049,
        },
      },
    },
  },
};
