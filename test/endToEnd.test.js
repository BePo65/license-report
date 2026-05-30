import assert from 'node:assert';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import url from 'node:url';
import util from 'node:util';
import eol from 'eol';
import {
  addRemoteVersionsToExpectedData,
  rawDataToCsv,
  rawDataToHtml,
  rawDataToJson,
  rawDataToMarkdown,
  rawDataToTable,
} from './fixture/expectedOutput.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const scriptPath = path.resolve(__dirname, '..', 'index.js').replace(/(\s+)/g, '\\$1');

// test data for e2e test using the default fields
const defaultFieldsPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'default-fields', 'package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using the default fields in monorepo
const defaultFieldsMonorepoPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'monorepo', 'sub-project', 'sub-sub-project', 'package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using all fields
const allFieldsPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'all-fields', 'package.json')
  .replace(/(\s+)/g, '\\$1');
const allFieldsConfigPath = path
  .resolve(__dirname, 'fixture', 'all-fields', 'license-report-config.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using custom fields
const customFieldsConfigPath = path
  .resolve(__dirname, 'fixture', 'all-fields', 'license-report-config-custom-fields.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using the default fields and local packages
const localPackagesPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'local-packages', 'package.json')
  .replace(/(\s+)/g, '\\$1');
const localPackagesConfigPath = path
  .resolve(__dirname, 'fixture', 'local-packages', 'license-report-config.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using package.json with empty dependencies
const emptyDepsPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencies', 'empty-dependency-package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using package.json with no dependencies
const noDepsPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencies', 'no-dependency-package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test using package.json with no dependencies
const subPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencies', 'sub-deps-package.json')
  .replace(/(\s+)/g, '\\$1');

// test data for e2e test with exclusions using package.json with multiple dependencies
const multiPackageJsonPath = path
  .resolve(__dirname, 'fixture', 'dependencies', 'multi-deps-package.json')
  .replace(/(\s+)/g, '\\$1');

const execAsPromise = util.promisify(cp.exec);

let expectedDataBase;

describe('end to end test', () => {
  describe('end to end test for default fields', { timeout: 60000 }, () => {
    beforeEach(async () => {
      expectedDataBase = EXPECTED_DEFAULT_FIELDS_RAW_DATA.slice(0);
      await addRemoteVersionsToExpectedData(expectedDataBase);
    });

    it('produce a json report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = rawDataToJson(expectedDataBase);

      assert.deepStrictEqual(result, expectedJsonResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a table report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath} --output=table`,
      );
      const expectedTableResult = rawDataToTable(expectedDataBase, EXPECTED_TABLE_TEMPLATE);

      assert.strictEqual(stdout, expectedTableResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a csv report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath} --output=csv --csvHeaders`,
      );
      const expectedCsvResult = rawDataToCsv(expectedDataBase, EXPECTED_CSV_TEMPLATE);

      assert.strictEqual(stdout, expectedCsvResult);
      assert.strictEqual(
        stderr,
        'Warning: field contains delimiter; value: "Dan VerWeire, Yaniv Kessler"\n',
      );
    });

    it('produce an html report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath} --output=html`,
      );
      const actualResult = eol.auto(stdout);
      const expectedHtmlTemplate = eol.auto(
        fs.readFileSync(path.join(__dirname, 'fixture', 'expectedOutput.e2e.html'), 'utf8'),
      );
      const expectedHtmlResult = rawDataToHtml(expectedDataBase, expectedHtmlTemplate);

      assert.strictEqual(actualResult, expectedHtmlResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a markdown table report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath} --output=markdown`,
      );
      const expectedMarkdownTableResult = rawDataToMarkdown(
        expectedDataBase,
        EXPECTED_MARKDOWN_TABLE_TEMPLATE,
      );

      assert.strictEqual(stdout, expectedMarkdownTableResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });

  describe('end to end test for default fields in monorepo', { timeout: 60000 }, () => {
    beforeEach(async () => {
      expectedDataBase = EXPECTED_DEFAULT_FIELDS_RAW_DATA.slice(0);
      await addRemoteVersionsToExpectedData(expectedDataBase);
    });

    it('produce a json report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsMonorepoPackageJsonPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = rawDataToJson(expectedDataBase);

      assert.deepStrictEqual(result, expectedJsonResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a table report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsMonorepoPackageJsonPath} --output=table`,
      );
      const expectedTableResult = rawDataToTable(expectedDataBase, EXPECTED_TABLE_TEMPLATE);

      assert.strictEqual(stdout, expectedTableResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a csv report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsMonorepoPackageJsonPath} --output=csv --csvHeaders`,
      );
      const expectedCsvResult = rawDataToCsv(expectedDataBase, EXPECTED_CSV_TEMPLATE);

      assert.strictEqual(stdout, expectedCsvResult);
      assert.strictEqual(
        stderr,
        'Warning: field contains delimiter; value: "Dan VerWeire, Yaniv Kessler"\n',
      );
    });

    it('produce an html report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsMonorepoPackageJsonPath} --output=html`,
      );
      const actualResult = eol.auto(stdout);
      const expectedHtmlTemplate = eol.auto(
        fs.readFileSync(path.join(__dirname, 'fixture', 'expectedOutput.e2e.html'), 'utf8'),
      );
      const expectedHtmlResult = rawDataToHtml(expectedDataBase, expectedHtmlTemplate);

      assert.strictEqual(actualResult, expectedHtmlResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a markdown table report', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsMonorepoPackageJsonPath} --output=markdown`,
      );
      const expectedMarkdownTableResult = rawDataToMarkdown(
        expectedDataBase,
        EXPECTED_MARKDOWN_TABLE_TEMPLATE,
      );

      assert.strictEqual(stdout, expectedMarkdownTableResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });

  describe('end to end test for local packages', { timeout: 50000 }, () => {
    beforeEach(async () => {
      expectedDataBase = EXPECTED_LOCAL_PACKAGES_RAW_DATA.slice(0);
      await addRemoteVersionsToExpectedData(expectedDataBase);
    });

    it('produce a json report', async () => {
      const { stdout } = await execAsPromise(
        `node ${scriptPath} --package=${localPackagesPackageJsonPath} --config=${localPackagesConfigPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = rawDataToJson(expectedDataBase);

      assert.deepStrictEqual(result, expectedJsonResult);
    });
  });

  describe('end to end test for all fields', { timeout: 50000 }, () => {
    it('produce a json report with the fields specified in config', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${allFieldsPackageJsonPath} --config=${allFieldsConfigPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedResult = [
        {
          department: 'kessler',
          relatedTo: 'stuff',
          name: 'semver',
          licensePeriod: 'perpetual',
          material: 'material',
          licenseType: 'ISC',
          link: 'git+https://github.com/npm/node-semver.git',
          installedFrom: 'https://registry.npmjs.org/semver/-/semver-7.5.3.tgz',
          remoteVersion: '7.5.4',
          latestRemoteVersion: '7.5.4',
          latestRemoteModified: '2022-07-25T16:10:58.611Z',
          installedVersion: '7.5.3',
          definedVersion: '^7.0.0',
          author: 'GitHub Inc.',
        },
      ];
      await addRemoteVersionsToExpectedData(expectedResult);

      assert.deepStrictEqual(
        result,
        expectedResult,
        `expected the output to contain all the configured fields`,
      );
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a json report without option "only"', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedLengthOfResult = 4;

      assert.strictEqual(
        result.length,
        expectedLengthOfResult,
        `expected the list to contain ${expectedLengthOfResult} elements`,
      );
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a json report with option "only=prod"', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath} --only=prod`,
      );
      const result = JSON.parse(stdout);
      const expectedLengthOfResult = 1;

      assert.strictEqual(
        result.length,
        expectedLengthOfResult,
        `expected the list to contain ${expectedLengthOfResult} elements`,
      );
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a json report with option "only=prod,opt,peer"', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath} --only=prod,opt,peer`,
      );
      const result = JSON.parse(stdout);
      const expectedLengthOfResult = 3;

      assert.strictEqual(
        result.length,
        expectedLengthOfResult,
        `expected the list to contain ${expectedLengthOfResult} elements`,
      );
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });

  describe('end to end test for single field', { timeout: 60000 }, () => {
    beforeEach(async () => {
      expectedDataBase = EXPECTED_SINGLE_FIELD_RAW_DATA.slice(0);
      await addRemoteVersionsToExpectedData(expectedDataBase);
    });

    it('produce a json report with a single field', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${defaultFieldsPackageJsonPath} --fields=name`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = rawDataToJson(expectedDataBase);

      assert.deepStrictEqual(result, expectedJsonResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });

  describe('end to end test package without dependencies', { timeout: 50000 }, () => {
    it('produce a json report for a package with empty dependencies', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${emptyDepsPackageJsonPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedResult = [];
      await addRemoteVersionsToExpectedData(expectedResult);

      assert.deepStrictEqual(result, expectedResult, `expected the output to contain no entries`);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a json report for a package without dependencies', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${noDepsPackageJsonPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedResult = [];
      await addRemoteVersionsToExpectedData(expectedResult);

      assert.deepStrictEqual(result, expectedResult, `expected the output to contain no entries`);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a json report for a package with sub-package without dependencies', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${subPackageJsonPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedResult = [
        {
          author: 'Dan VerWeire, Yaniv Kessler',
          definedVersion: '^1.0.2',
          department: 'kessler',
          installedVersion: '1.0.2',
          licensePeriod: 'perpetual',
          licenseType: 'MIT',
          link: 'git+https://github.com/kessler/node-tableify.git',
          material: 'material',
          name: '@kessler/tableify',
          relatedTo: 'stuff',
          remoteVersion: '1.0.2',
        },
        {
          author: 'TJ Holowaychuk <tj@vision-media.ca>',
          definedVersion: '^9.1.1',
          department: 'kessler',
          installedVersion: '9.1.2',
          licensePeriod: 'perpetual',
          licenseType: 'MIT',
          link: 'git+https://github.com/mochajs/mocha.git',
          material: 'material',
          name: 'mocha',
          relatedTo: 'stuff',
          remoteVersion: '9.2.2',
        },
      ];
      await addRemoteVersionsToExpectedData(expectedResult);

      assert.deepStrictEqual(result, expectedResult, `expected the output to contain no entries`);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a markdown report for a package with empty dependencies', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${emptyDepsPackageJsonPath} --output=markdown`,
      );
      const result = stdout;
      const expectedResult = '\n';

      assert.deepStrictEqual(result, expectedResult, `expected the output to contain no entries`);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a markdown report for a package with no dependencies', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${noDepsPackageJsonPath} --output=markdown`,
      );
      const result = stdout;
      const expectedResult = '\n';

      assert.deepStrictEqual(result, expectedResult, `expected the output to contain no entries`);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });

  describe('end to end test for custom fields', { timeout: 50000 }, () => {
    it('produce a json report with custom fields specified in config', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${allFieldsPackageJsonPath} --config=${customFieldsConfigPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedResult = [
        {
          department: 'kessler',
          relatedTo: 'stuff',
          name: 'semver',
          licensePeriod: 'perpetual',
          material: 'material',
          licenseType: 'ISC',
          link: 'git+https://github.com/npm/node-semver.git',
          installedFrom: 'https://registry.npmjs.org/semver/-/semver-7.5.3.tgz',
          remoteVersion: '5.7.1',
          latestRemoteVersion: '7.5.4',
          latestRemoteModified: '2022-07-25T16:10:58.611Z',
          installedVersion: '7.5.3',
          definedVersion: '^7.0.0',
          author: 'GitHub Inc.',
          description: 'The semantic version parser used by npm.',
        },
      ];
      await addRemoteVersionsToExpectedData(expectedResult);

      assert.deepStrictEqual(
        result,
        expectedResult,
        `expected the output to contain all the configured fields`,
      );
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a json report with custom nested field', async () => {
      const nestedFieldsPackageJsonPath = path
        .resolve(__dirname, 'fixture', 'custom-nested-fields', 'package.json')
        .replace(/(\s+)/g, '\\$1');

      const nestedFieldsConfigPath = path
        .resolve(__dirname, 'fixture', 'custom-nested-fields', 'config-nested-fields.json')
        .replace(/(\s+)/g, '\\$1');

      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${nestedFieldsPackageJsonPath} --config=${nestedFieldsConfigPath}`,
      );
      const result = JSON.parse(stdout);
      const expectedResult = [
        {
          name: 'debug',
          licenseType: 'MIT',
          link: 'git://github.com/debug-js/debug.git',
          installedFrom: 'https://registry.npmjs.org/debug/-/debug-4.3.6.tgz',
          remoteVersion: '4.3.7',
          installedVersion: '4.3.6',
          definedVersion: '^4.3.6',
          latestRemoteVersion: '4.3.7',
          latestRemoteModified: '2024-09-06T00:52:57.861Z',
          author: 'Josh Junon (https://github.com/qix-)',
          description: 'Lightweight debugging utility for Node.js and the browser',
          repository: {
            type: 'git',
            url: 'git://github.com/debug-js/debug.git',
          },
          'repository.url': 'git://github.com/debug-js/debug.git',
        },
        {
          name: 'got',
          licenseType: 'MIT',
          link: 'git+https://github.com/sindresorhus/got.git',
          installedFrom: 'https://registry.npmjs.org/got/-/got-14.4.2.tgz',
          remoteVersion: '14.4.2',
          installedVersion: '14.4.2',
          definedVersion: '^14.4.2',
          latestRemoteVersion: '14.4.2',
          latestRemoteModified: '2024-08-21T20:39:07.774Z',
          author: 'n/a',
          description: 'Human-friendly and powerful HTTP request library for Node.js',
          repository: 'sindresorhus/got',
          'repository.url': 'n/a',
        },
      ];
      await addRemoteVersionsToExpectedData(expectedResult);

      assert.deepStrictEqual(
        result,
        expectedResult,
        `expected the output to contain all the configured fields`,
      );
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });

  describe('end to end test with exclusions', { timeout: 50000 }, () => {
    beforeEach(async () => {
      expectedDataBase = EXPECTED_MULTI_DEPS_RAW_DATA.slice(0);
      await addRemoteVersionsToExpectedData(expectedDataBase);
    });

    it('produce a report excluding a single package', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${multiPackageJsonPath} --exclude=tablemark --fields=name --fields=installedVersion`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = rawDataToJson(expectedDataBase);
      expectedJsonResult.splice(1, 1);

      assert.deepStrictEqual(result, expectedJsonResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a report excluding an array of packages', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${multiPackageJsonPath} --exclude=tablemark --exclude=text-table --fields=name --fields=installedVersion`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = rawDataToJson(expectedDataBase);
      expectedJsonResult.splice(1, 2);

      assert.deepStrictEqual(result, expectedJsonResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });

    it('produce a report excluding packages with a regular expression', async () => {
      const { stdout, stderr } = await execAsPromise(
        `node ${scriptPath} --package=${multiPackageJsonPath} --excludeRegex=@commitlint/.* --fields=name --fields=installedVersion`,
      );
      const result = JSON.parse(stdout);
      const expectedJsonResult = rawDataToJson(expectedDataBase);
      expectedJsonResult.splice(3, 2);

      assert.deepStrictEqual(result, expectedJsonResult);
      assert.strictEqual(stderr, '', 'expected no warnings');
    });
  });
});

// raw data we use to generate the expected results for default fields test
const EXPECTED_DEFAULT_FIELDS_RAW_DATA = [
  {
    author: 'Dan VerWeire, Yaniv Kessler',
    department: 'kessler',
    relatedTo: 'stuff',
    name: '@kessler/tableify',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'MIT',
    link: 'git+https://github.com/kessler/node-tableify.git',
    remoteVersion: '_VERSION_',
    installedVersion: '1.0.2',
    definedVersion: '^1.0.2',
  },
  {
    author: 'TJ Holowaychuk <tj@vision-media.ca>',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'mocha',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'MIT',
    link: 'git+https://github.com/mochajs/mocha.git',
    remoteVersion: '_VERSION_',
    installedVersion: '9.1.2',
    definedVersion: '^9.1.1',
  },
  {
    author: 'John-David Dalton <john.david.dalton@gmail.com>',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'lodash',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'MIT',
    link: 'git+https://github.com/lodash/lodash.git',
    remoteVersion: '_VERSION_',
    installedVersion: '4.17.21',
    definedVersion: '^4.17.20',
  },
  {
    author: 'GitHub Inc.',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'semver',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'ISC',
    link: 'git+https://github.com/npm/node-semver.git',
    remoteVersion: '_VERSION_',
    installedVersion: '7.5.4',
    definedVersion: '^7.5.1',
  },
];

// raw data we use to generate the expected results for single field test
const EXPECTED_SINGLE_FIELD_RAW_DATA = [
  {
    name: '@kessler/tableify',
  },
  {
    name: 'mocha',
  },
  {
    name: 'lodash',
  },
  {
    name: 'semver',
  },
];

// raw data we use to generate the expected results for default fields test
const EXPECTED_LOCAL_PACKAGES_RAW_DATA = [
  {
    author: 'Caolan McMahon',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'async',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'MIT',
    link: 'n/a',
    installedFrom: 'github:caolan/async',
    remoteVersion: '_VERSION_',
    installedVersion: '3.2.4',
    definedVersion: 'n/a',
  },
  {
    author: 'GitHub Inc.',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'semver',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'ISC',
    link: 'git+https://github.com/npm/node-semver.git',
    installedFrom: 'https://registry.npmjs.org/semver/-/semver-7.5.4.tgz',
    remoteVersion: '_VERSION_',
    installedVersion: '7.5.4',
    definedVersion: '^7.5.3',
  },
  {
    author: 'Josh Junon <josh.junon@protonmail.com>',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'debug',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'MIT',
    link: 'n/a',
    installedFrom: 'git://github.com/debug-js/debug.git',
    remoteVersion: '_VERSION_',
    installedVersion: '4.3.4',
    definedVersion: 'n/a',
  },
  {
    author: 'John Doe',
    department: 'kessler',
    relatedTo: 'stuff',
    name: 'my-local-package',
    licensePeriod: 'perpetual',
    material: 'material',
    licenseType: 'MIT',
    link: 'n/a',
    installedFrom: 'file:local-libs/my-local-package',
    remoteVersion: '_VERSION_',
    installedVersion: '1.1.4',
    definedVersion: 'n/a',
  },
];

/*
	template for csv output; usage:
	{{key}} - value to be replaced with value from package information
	[[package-name]] - name of the package
*/
const EXPECTED_CSV_TEMPLATE = `department,related to,name,license period,material / not material,license type,link,remote version,installed version,defined version,author
{{department}},{{relatedTo}},[[@kessler/tableify]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{definedVersion}},{{author}}
{{department}},{{relatedTo}},[[mocha]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{definedVersion}},{{author}}
{{department}},{{relatedTo}},[[lodash]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{definedVersion}},{{author}}
{{department}},{{relatedTo}},[[semver]],{{licensePeriod}},{{material}},{{licenseType}},{{link}},{{remoteVersion}},{{installedVersion}},{{definedVersion}},{{author}}
`;

/*
	template for table output; usage:
	{{key}} - value to be replaced with value from package information
	[[package-name]] - name of the package
*/
const EXPECTED_TABLE_TEMPLATE = `{{department}}  {{relatedTo}}  {{name}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{definedVersion}}  {{author}}
{{department}}  {{relatedTo}}  {{name}}  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{definedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[@kessler/tableify]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{definedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[mocha]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{definedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[lodash]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{definedVersion}}  {{author}}
{{department}}  {{relatedTo}}  [[semver]]  {{licensePeriod}}  {{material}}  {{licenseType}}  {{link}}  {{remoteVersion}}  {{installedVersion}}  {{definedVersion}}  {{author}}
`;

/*
	template for markdown table output; usage:
	{{key}} - value to be replaced with value from package information
	[[package-name]] - name of the package
*/
const EXPECTED_MARKDOWN_TABLE_TEMPLATE = `| Department | Related to | Name              | License period | Material not material | License type | Link                                             | Remote version | Installed version | Defined version | Author                                          |
| :--------- | :--------- | :---------------- | :------------- | :-------------------- | :----------- | :----------------------------------------------- | :------------- | :---------------- | :-------------- | :---------------------------------------------- |
| {{department}}    | {{relatedTo}}      | [[@kessler/tableify]] | {{licensePeriod}}      | {{material}}              | {{licenseType}}          | {{link}} | {{remoteVersion}}          | {{installedVersion}}             | {{definedVersion}}          | {{author}}                     |
| {{department}}    | {{relatedTo}}      | [[mocha]]             | {{licensePeriod}}      | {{material}}              | {{licenseType}}          | {{link}}         | {{remoteVersion}}          | {{installedVersion}}             | {{definedVersion}}          | {{author}}             |
| {{department}}    | {{relatedTo}}      | [[lodash]]            | {{licensePeriod}}      | {{material}}              | {{licenseType}}          | {{link}}         | {{remoteVersion}}         | {{installedVersion}}           | {{definedVersion}}        | {{author}} |
| {{department}}    | {{relatedTo}}      | [[semver]]            | {{licensePeriod}}      | {{material}}              | {{licenseType}}          | {{link}}       | {{remoteVersion}}          | {{installedVersion}}             | {{definedVersion}}          | {{author}}                                     |

`;

const EXPECTED_MULTI_DEPS_RAW_DATA = [
  {
    name: '@kessler/tableify',
    installedVersion: '1.0.2',
  },
  {
    name: 'tablemark',
    installedVersion: '4.1.0',
  },
  {
    name: 'text-table',
    installedVersion: '0.2.0',
  },
  {
    name: '@commitlint/cli',
    installedVersion: '17.7.1',
  },
  {
    name: '@commitlint/config-conventional',
    installedVersion: '17.7.0',
  },
  {
    name: 'mocha',
    installedVersion: '9.1.2',
  },
];
