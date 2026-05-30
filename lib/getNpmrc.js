import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import createDebugMessages from 'debug';
import { findUpSync } from 'find-up-simple';
import { parse } from 'ini';

import { config } from './config.js';
import { isNullOrUndefined } from './util.js';

const debug = createDebugMessages('license-report:getNpmrc');

const defaultUrl = 'https://registry.npmjs.org/';
const scopeMatcher = /^(@\S+):registry$/;
const authTokenMatcher = /^(\/\/\S+):_authToken$/;

/**
 * find npmrc file in project directory or user home directory
 * @param {string} filePath - path to npmrc file to use (optional)
 * @returns {string} path to npm config file
 */
function getNpmrcPath(filePath) {
  let npmrcPath = filePath;
  if (isNullOrUndefined(npmrcPath) || !existsSync(npmrcPath)) {
    // look for .npmrc file in current working directory and above
    npmrcPath = findUpSync('.npmrc');
  }

  if (npmrcPath === undefined) {
    if (process.platform === 'win32') {
      npmrcPath = path.join(`${process.env.HOMEDRIVE}${process.env.HOMEPATH}`, '.npmrc');
    } else {
      npmrcPath = path.join(`${process.env.HOME}`, '.npmrc');
    }

    if (!existsSync(npmrcPath)) {
      npmrcPath = undefined;
    }
  }

  return npmrcPath;
}

/**
 * Get the registry related information from the .npmrc file of parameter,
 * project or user.
 *
 * Structure of return value:
 * {
 *   defaultRegistry  // default uri of registry
 *   envRegistry      // uri of registry from environment variable NPM_CONFIG_REGISTRY
 *   scopes: {
 *     '@scope1'      // name of 1st scope; value is uri of registry for this scope
 *     '@scope2'      // name of 2nd scope; value is uri of registry for this scope
 *   }
 *   authTokens: [
 *     {'uri1'}       // uri of 1st scope; value is authorization token of registry for this uri
 *     {'uri2'}       // uri of 2nd scope; value is authorization token of registry for this uri
 *   ]
 * }
 * authTokens is sorted so that longer uri come before shorter ones
 * @param {string} filePath - path to npmrc file to use (optional)
 * @returns {object} containing the registry data from .npmrc file
 */
export function getNpmConfig(filePath) {
  const npmConfig = {
    defaultRegistry: defaultUrl,
  };

  if (
    config.npmTokenEnvVar !== null &&
    config.npmTokenEnvVar !== undefined &&
    config[config.npmTokenEnvVar] !== undefined
  ) {
    console.warn(
      `the environment variable '${config.npmTokenEnvVar}' containing the token used by npm to access the private repository should not be a configuration parameter (this is a severe security problem!)`,
    );
  }

  // Get uri for registry from environment variable
  // In Windows the name of environment variables are case insensitive
  const npmConfigRegistry = process.env.npm_config_registry ?? process.env.NPM_CONFIG_REGISTRY;
  debug('getNpmrc - registry from environment: %s', npmConfigRegistry);
  if (npmConfigRegistry !== undefined) {
    npmConfig.envRegistry = npmConfigRegistry;
  }

  const npmRcPath = getNpmrcPath(filePath);
  debug('getNpmrc - path to .npmrc file: %s', npmRcPath);

  // Evaluate .npmrc file
  if (config.useNpmrc && npmRcPath !== undefined) {
    const npmrc = parse(readFileSync(npmRcPath, 'utf8'));
    if (Object.hasOwn(npmrc, 'registry')) {
      npmConfig.defaultRegistry = npmrc.registry;
    }

    for (const [key, value] of Object.entries(npmrc)) {
      const scopeResult = key.match(scopeMatcher);
      if (scopeResult !== null && scopeResult.length >= 2) {
        if (npmConfig.scopes === undefined) {
          npmConfig.scopes = {};
        }
        npmConfig.scopes[scopeResult[1]] = value;
      }

      const authTokenResult = key.match(authTokenMatcher);
      if (authTokenResult !== null && authTokenResult.length >= 2) {
        if (npmConfig.authTokens === undefined) {
          npmConfig.authTokens = [];
        }
        const newAuthToken = {};
        newAuthToken[authTokenResult[1]] = value;
        npmConfig.authTokens.push(newAuthToken);
      }
    }
  }

  // Use config.npmTokenEnvVar to set authToken for default registry
  const npmDefaultToken = process.env[config.npmTokenEnvVar] ?? '';
  if (npmDefaultToken.trim().length > 0) {
    const normalizedRegistryUri = npmConfig.defaultRegistry.replace(/^https?:/, '');

    // Add token to authTokens for this path
    if (npmConfig.authTokens === undefined) {
      npmConfig.authTokens = [];
    }
    const newAuthToken = {};
    newAuthToken[normalizedRegistryUri] = npmDefaultToken.trim();
    // Add token only, if it does not already exist in authTokens
    const index = npmConfig.authTokens.findIndex(
      (entry) => Object.keys(entry)[0] === normalizedRegistryUri,
    );
    if (index === -1) {
      npmConfig.authTokens.push(newAuthToken);
    }
  }

  // sort authTokens for length of uri to ensure to get the right authorization token
  if (npmConfig.authTokens !== undefined) {
    npmConfig.authTokens.sort((a, b) => {
      const keyA = Object.keys(a)[0];
      const keyB = Object.keys(b)[0];
      return keyB.length - keyA.length;
    });
  }

  return npmConfig;
}
