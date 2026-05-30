import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getRegistryAccessData } from '../lib/getRegistryAccessData.js';

describe('getRegistryAccessData', () => {
  describe('using minimal npmrc (default registry, no tokens)', () => {
    const npmrcMinimal = {
      defaultRegistry: 'https://registry.npmjs.org/',
      scopes: {},
      authTokens: [],
    };

    it('should return default registry URI (normalized) and empty token for non-scoped package', () => {
      const result = getRegistryAccessData('mypackage', npmrcMinimal);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, '');
    });

    it('should return default registry URI (normalized) and empty token for scoped package not in scopes', () => {
      const result = getRegistryAccessData('@unknownscope/pkg', npmrcMinimal);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, '');
    });
  });

  describe('using npmrc with default token', () => {
    const npmrcDefaultWithToken = {
      defaultRegistry: 'https://registry.npmjs.org/',
      scopes: {},
      authTokens: [{ '//registry.npmjs.org/': 'NPM_TOKEN' }],
    };

    it('should return default registry URI (normalized) and its token for non-scoped package', () => {
      const result = getRegistryAccessData('mypackage', npmrcDefaultWithToken);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, 'NPM_TOKEN');
    });
  });

  describe('using npmrc with scopes and tokens', () => {
    const npmrcScoped = {
      defaultRegistry: 'https://registry.npmjs.org/',
      scopes: {
        '@myorg': 'https://myorg.registry.com/main/', // Has trailing slash
        '@another': 'https://another.registry.com', // No trailing slash
      },
      authTokens: [
        // Assumed to be sorted by specificity (longest key first) by getNpmrc
        { '//another.registry.com/': 'ANOTHER_TOKEN' }, // Token key has trailing slash
        { '//myorg.registry.com/main/': 'MYORG_TOKEN' },
        { '//registry.npmjs.org/': 'NPM_TOKEN' },
      ],
    };

    it('should return scoped registry URI and its token for a known scoped package (@myorg)', () => {
      const result = getRegistryAccessData('@myorg/pkg', npmrcScoped);

      assert.strictEqual(result.uri, 'https://myorg.registry.com/main/');
      assert.strictEqual(result.authToken, 'MYORG_TOKEN');
    });

    it('should return scoped registry URI (normalized) and its token for another known scoped package (@another)', () => {
      // Scope URI 'https://another.registry.com' (no slash), Token key '//another.registry.com/' (has slash)
      const result = getRegistryAccessData('@another/pkg', npmrcScoped);

      assert.strictEqual(result.uri, 'https://another.registry.com/'); // Expect normalized URI
      assert.strictEqual(result.authToken, 'ANOTHER_TOKEN');
    });

    it('should return default registry URI (normalized) and its token for a non-scoped package', () => {
      const result = getRegistryAccessData('someotherpkg', npmrcScoped);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, 'NPM_TOKEN');
    });

    it('should return default registry URI (normalized) and its token for a scoped package not in scopes', () => {
      const result = getRegistryAccessData('@unknown/pkg', npmrcScoped);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, 'NPM_TOKEN');
    });
  });

  describe('using npmrc with envRegistry override', () => {
    const npmrcEnvOverride = {
      defaultRegistry: 'https://registry.npmjs.org/',
      envRegistry: 'https://env.custom.com/registry/',
      scopes: {
        '@myorg': 'https://myorg.registry.com/main/',
      },
      authTokens: [
        { '//env.custom.com/registry/': 'ENV_TOKEN' },
        { '//myorg.registry.com/main/': 'MYORG_TOKEN' },
        { '//registry.npmjs.org/': 'NPM_TOKEN' },
      ],
    };

    it('should use envRegistry (normalized) for non-scoped package and its token', () => {
      const result = getRegistryAccessData('mypackage', npmrcEnvOverride);

      assert.strictEqual(result.uri, 'https://env.custom.com/registry/');
      assert.strictEqual(result.authToken, 'ENV_TOKEN');
    });

    it('should use envRegistry (normalized) for scoped package not in scopes and envRegistry token', () => {
      const result = getRegistryAccessData('@unknownscope/pkg', npmrcEnvOverride);

      assert.strictEqual(result.uri, 'https://env.custom.com/registry/');
      assert.strictEqual(result.authToken, 'ENV_TOKEN');
    });

    it('should use scoped registry for known scoped package, overriding envRegistry', () => {
      const result = getRegistryAccessData('@myorg/pkg', npmrcEnvOverride);

      assert.strictEqual(result.uri, 'https://myorg.registry.com/main/');
      assert.strictEqual(result.authToken, 'MYORG_TOKEN');
    });
  });

  describe('token matching specificity', () => {
    it('should pick the most specific token for default registry', () => {
      const npmrcSpecificTokens = {
        defaultRegistry: 'https://specific.registry.com/api/npm/',
        scopes: {},
        authTokens: [
          // Sorted by length: most specific first
          { '//specific.registry.com/api/npm/private/': 'TOKEN_PRIVATE' },
          { '//specific.registry.com/api/npm/': 'TOKEN_NPM_API' },
          { '//specific.registry.com/api/': 'TOKEN_API' },
          { '//specific.registry.com/': 'TOKEN_GENERAL' },
        ],
      };

      const result = getRegistryAccessData('somepackage', npmrcSpecificTokens);

      assert.strictEqual(result.uri, 'https://specific.registry.com/api/npm/');
      assert.strictEqual(result.authToken, 'TOKEN_NPM_API');
    });

    it('should pick the most specific token for a scoped registry', () => {
      const npmrcScopedSpecificTokens = {
        defaultRegistry: 'https://public.registry.com/',
        scopes: {
          '@pro': 'https://specific.registry.com/api/npm/private/',
        },
        authTokens: [
          { '//specific.registry.com/api/npm/private/': 'TOKEN_PRIVATE' },
          { '//specific.registry.com/api/npm/': 'TOKEN_NPM_API' }, // Less specific for the scope
          { '//public.registry.com/': 'TOKEN_PUBLIC' },
        ],
      };

      const result = getRegistryAccessData('@pro/superlib', npmrcScopedSpecificTokens);

      assert.strictEqual(result.uri, 'https://specific.registry.com/api/npm/private/');
      assert.strictEqual(result.authToken, 'TOKEN_PRIVATE');
    });
  });

  describe('npmrc with no authTokens array', () => {
    const npmrcNoAuthArray = {
      defaultRegistry: 'https://registry.npmjs.org/',
      scopes: {},
      // authTokens is undefined
    };

    it('should return empty token if authTokens array is missing', () => {
      const result = getRegistryAccessData('mypackage', npmrcNoAuthArray);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, '');
    });
  });

  describe('npmrc with empty authTokens array', () => {
    const npmrcEmptyAuthArray = {
      defaultRegistry: 'https://registry.npmjs.org/',
      scopes: {},
      authTokens: [], // empty array
    };

    it('should return empty token if authTokens array is empty', () => {
      const result = getRegistryAccessData('mypackage', npmrcEmptyAuthArray);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, '');
    });
  });

  describe('npmrc with no scopes object', () => {
    const npmrcNoScopes = {
      defaultRegistry: 'https://registry.npmjs.org/',
      // scopes is undefined
      authTokens: [{ '//registry.npmjs.org/': 'NPM_TOKEN' }],
    };

    it('should use default registry for scoped package if scopes object is missing', () => {
      const result = getRegistryAccessData('@myorg/pkg', npmrcNoScopes);

      assert.strictEqual(result.uri, 'https://registry.npmjs.org/');
      assert.strictEqual(result.authToken, 'NPM_TOKEN');
    });
  });

  describe('edge cases', () => {
    it('should throw on undefined npmrcConfig', () => {
      assert.throws(
        () => {
          getRegistryAccessData('somepackage', undefined);
        },
        {
          name: 'TypeError',
          message: "Cannot read properties of undefined (reading 'envRegistry')",
        },
      );
    });
  });
});
