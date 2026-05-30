import createDebugMessages from 'debug';
import got from 'got';

import { config } from './config.js';
import { getRegistryAccessData } from './getRegistryAccessData.js';
import { joinUrlPath } from './util.js';

const debug = createDebugMessages('license-report:getPackageDataFromRepository');

/**
 * Fetch the information about one package from the (npm) registry
 * @param {string} name - full name of the package
 * @param {object} npmrc - object with npm configuration data to use
 * @returns {object} with all information about a package
 */
export async function getPackageDataFromRepository(name, npmrc) {
  // Get uri and authToken for registry access for this package
  const registryData = getRegistryAccessData(name, npmrc);
  const uri = joinUrlPath(registryData.uri, name);

  debug('getPackageDataFromRepository - REQUEST %s', uri);

  const options = {
    retry: config.httpRetryOptions,
    timeout: config.httpTimeoutOptions,
    hooks: {
      beforeRetry: [
        // eslint-disable-next-line no-unused-vars
        (_error, _retryCount) => {
          debug(`http request to npm for package "${name}" failed, retrying again soon...`);
        },
      ],
      beforeError: [
        (error) => {
          debug(error);
          return error;
        },
      ],
    },
  };

  if (registryData.authToken.trim().length > 0) {
    options.headers = {
      Authorization: `Bearer ${registryData.authToken}`,
    };
  }

  let response = {};
  try {
    response = await got(uri, options).json();
  } catch (error) {
    debug(`http request to npm for package "${name}" failed with error '${error}'`);
  }

  return response;
}
