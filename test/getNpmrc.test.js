import assert from 'node:assert';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import url from 'node:url';
import { config } from '../lib/config.js';
import { getNpmConfig } from '../lib/getNpmrc.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const npmrcPath = path.resolve(__dirname, 'fixture', 'npmrc', '.npmrc').replace(/(\s+)/g, '\\$1');

const npmrcPathWithoutDefToken = path
  .resolve(__dirname, 'fixture', 'npmrc', 'npmrc-without-default-token')
  .replace(/(\s+)/g, '\\$1');

const npmrcPathWithOtherDefReg = path
  .resolve(__dirname, 'fixture', 'npmrc', 'npmrc-with-other-default-reg')
  .replace(/(\s+)/g, '\\$1');

const npmrcPathWithoutContent = path
  .resolve(__dirname, 'fixture', 'npmrc', 'npmrc-without-content')
  .replace(/(\s+)/g, '\\$1');

describe('getNpmrc', () => {
  describe('using npmrc file', () => {
    let oldConfigUseNpmrc;

    beforeEach(() => {
      oldConfigUseNpmrc = config.useNpmrc;
    });

    afterEach(() => {
      config.useNpmrc = oldConfigUseNpmrc;
    });

    it('without parameter - returns an object with registry data', () => {
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
      };
      const npmrc = getNpmConfig();

      assert.deepEqual(npmrc, expected);
    });

    it('without "useNpmrc" ignores given path to .npmrc file', () => {
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
      };
      const npmrc = getNpmConfig(npmrcPath);

      assert.deepEqual(npmrc, expected);
    });

    it('uses given path to .npmrc file', () => {
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
        scopes: {
          '@myorg': 'https://somewhere-else.com/myorg',
          '@another': 'https://somewhere-else.com/another',
        },
        authTokens: [
          { '//somewhere-else.com/another/': 'MYTOKEN2' },
          { '//somewhere-else.com/myorg/': 'MYTOKEN1' },
          { '//registry.npmjs.org/': 'MYTOKEN' },
        ],
      };
      config.useNpmrc = true;
      const npmrc = getNpmConfig(npmrcPath);

      assert.deepEqual(npmrc, expected);
    });

    it('should handle an empty .npmrc file gracefully', () => {
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
      };
      config.useNpmrc = true;
      const npmrc = getNpmConfig(npmrcPathWithoutContent);

      assert.deepEqual(npmrc, expected);
    });
  });

  describe('using NPM_CONFIG_REGISTRY environment variable for registry', () => {
    let oldEnvRegistryLower;
    let oldEnvRegistryUpper;

    beforeEach(() => {
      oldEnvRegistryLower = process.env.npm_config_registry;
      oldEnvRegistryUpper = process.env.NPM_CONFIG_REGISTRY;
    });

    afterEach(() => {
      if (oldEnvRegistryLower === undefined) {
        delete process.env.npm_config_registry;
      } else {
        process.env.npm_config_registry = oldEnvRegistryLower;
      }

      if (oldEnvRegistryUpper === undefined) {
        delete process.env.NPM_CONFIG_REGISTRY;
      } else {
        process.env.npm_config_registry = oldEnvRegistryUpper;
      }
    });

    it('should use NPM_CONFIG_REGISTRY if set', () => {
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
        envRegistry: 'http://env.altregistry.com/',
      };
      process.env.NPM_CONFIG_REGISTRY = 'http://env.altregistry.com/';
      const npmrc = getNpmConfig();

      assert.deepEqual(npmrc, expected);
    });

    it('should use npm_config_registry if set', () => {
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
        envRegistry: 'http://env.registry.com/',
      };
      delete process.env.NPM_CONFIG_REGISTRY;
      process.env.npm_config_registry = 'http://env.registry.com/';
      const npmrc = getNpmConfig();

      assert.deepEqual(npmrc, expected);
    });

    it('should prioritize npm_config_registry over NPM_CONFIG_REGISTRY', function () {
      if (process.platform !== 'win32') {
        const expected = {
          defaultRegistry: 'https://registry.npmjs.org/',
          envRegistry: 'http://env.registry.com/',
        };
        process.env.npm_config_registry = 'http://env.registry.com/';
        process.env.NPM_CONFIG_REGISTRY = 'http://env.altregistry.com/';
        const npmrc = getNpmConfig();

        assert.deepEqual(npmrc, expected);
      } else {
        this.skip(
          `test skipped running on windows (here environment variables are case insensitive)`,
        );
      }
    });
  });

  describe('using npmTokenEnvVar for default registry authorization token', () => {
    const testTokenEnvVar = 'TEST_NPM_TOKEN_FOR_DEFAULT_REG';
    let oldConfigUseNpmrc;

    beforeEach(() => {
      config.npmTokenEnvVar = testTokenEnvVar;
      oldConfigUseNpmrc = config.useNpmrc;
    });

    afterEach(() => {
      delete process.env[testTokenEnvVar];
      config.useNpmrc = oldConfigUseNpmrc;
    });

    it('should add auth token from env var if no .npmrc is used', () => {
      process.env[testTokenEnvVar] = 'env_default_token';
      config.useNpmrc = false;
      const npmrc = getNpmConfig();

      assert.deepStrictEqual(npmrc.authTokens, [{ '//registry.npmjs.org/': 'env_default_token' }]);
    });

    it('should add auth token from env var if .npmrc has no token for default registry', () => {
      const testToken = 'env_default_token_2';
      process.env[testTokenEnvVar] = testToken;
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
        scopes: {
          '@myorg': 'https://somewhere-else.com/myorg',
          '@another': 'https://somewhere-else.com/another',
        },
        authTokens: [
          { '//somewhere-else.com/another/': 'MYTOKEN2' },
          { '//somewhere-else.com/myorg/': 'MYTOKEN1' },
          { '//registry.npmjs.org/': testToken },
        ],
      };
      config.useNpmrc = true;
      const npmrc = getNpmConfig(npmrcPathWithoutDefToken);

      assert.deepEqual(npmrc, expected);
    });

    it('should NOT add auth token from env var if .npmrc already provides one for the exact default registry URI', () => {
      process.env[testTokenEnvVar] = 'env_default_token_ignored';
      const expected = {
        defaultRegistry: 'https://registry.npmjs.org/',
        scopes: {
          '@myorg': 'https://somewhere-else.com/myorg',
          '@another': 'https://somewhere-else.com/another',
        },
        authTokens: [
          { '//somewhere-else.com/another/': 'MYTOKEN2' },
          { '//somewhere-else.com/myorg/': 'MYTOKEN1' },
          { '//registry.npmjs.org/': 'MYTOKEN' },
        ],
      };
      config.useNpmrc = true;
      const npmrc = getNpmConfig(npmrcPath);

      assert.deepEqual(npmrc, expected);
    });

    it('should not add auth token if env var is empty or whitespace', () => {
      process.env[testTokenEnvVar] = '   ';
      config.useNpmrc = false;
      const npmrc = getNpmConfig();

      assert.strictEqual(npmrc.authTokens, undefined);
    });

    it('should add auth token from env var for a defaultRegistry overridden by .npmrc', () => {
      process.env[testTokenEnvVar] = 'env_token_for_custom_default';
      const expected = {
        defaultRegistry: 'https://some-other-default-registry.com/',
        scopes: {
          '@myorg': 'https://somewhere-else.com/myorg',
          '@another': 'https://somewhere-else.com/another',
        },
        authTokens: [
          {
            '//some-other-default-registry.com/': 'env_token_for_custom_default',
          },
          { '//somewhere-else.com/another/': 'MYTOKEN2' },
          { '//somewhere-else.com/myorg/': 'MYTOKEN1' },
        ],
      };
      config.useNpmrc = true;
      const npmrc = getNpmConfig(npmrcPathWithOtherDefReg);

      assert.deepEqual(npmrc, expected);
    });
  });
});
