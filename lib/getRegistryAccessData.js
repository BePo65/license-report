import createDebugMessages from 'debug';

const debug = createDebugMessages('license-report:getRegistryAccessData');

/**
 * Get the registry uri and the required access token (if available)
 * for a package with the given name.
 * The function returns an object with the following structure:
 * {
 *   uri        // uri of the registry to use
 *   authToken: // authentication token to use or '' if none is available
 * }
 * @param {string} name - name of the package to get the registry data for
 * @param {object} npmrc - npm configuration data to get the uri / authentication from
 * @returns {object} with uri and authentication token
 */
export function getRegistryAccessData(name, npmrc) {
  debug('getRegistryAccessData - package %s', name);

  const result = {
    uri: npmrc.envRegistry ?? npmrc.defaultRegistry,
    authToken: '',
  };

  const nameParts = name.split('/');
  if (nameParts.length > 1 && nameParts[0].startsWith('@')) {
    const scope = nameParts[0];
    result.uri = npmrc.scopes?.[scope] ?? npmrc.envRegistry ?? npmrc.defaultRegistry;
  }

  // Ensure trailing slash for consistent matching, as .npmrc token URIs often have it.
  if (result.uri.length > 0 && !result.uri.endsWith('/')) {
    result.uri += '/';
  }
  debug('getRegistryAccessData - registry uri %s', result.uri);

  // Get the authToken for this registry uri from npmrc.authTokens
  if (npmrc.authTokens !== undefined) {
    const normalizedRegistryUri = result.uri.replace(/^https?:/, '');

    for (const tokenEntry of npmrc.authTokens) {
      const tokenUri = Object.keys(tokenEntry)[0]; // Key from .npmrc, e.g. '//some-registry/'
      if (tokenUri && normalizedRegistryUri.startsWith(tokenUri)) {
        result.authToken = tokenEntry[tokenUri];
        // Found the most specific token due to prior sorting of authTokens
        break;
      }
    }
  }

  return result;
}
