import { addPackagesToIndex } from './addPackagesToIndex.js';
import { isNullOrUndefined } from './util.js';

/**
 * Get dependencies from given package.json file that follow the definition in 'inclusions' and 'exclusions'.
 * For each package the following information is added: 'name', 'fullName', 'alias', 'version', 'scope'
 * 'inclusions' is equivalent to the 'only' parameter in the config file, split into an array of strings.
 * Complete list: ['prod', 'dev', 'opt', 'peer'] or null or undefined.
 * 'exclusions' is equivalent to the 'exclude' parameter in the config file.
 * @param {object} packageJson - content of package.json
 * @param {string[]} exclusions - array of package names to be excluded (from config.exclude)
 * @param {string[]} inclusions - array of strings of types of dependencies to be included (from config.only)
 * @param {string[]} exclusionRegex - RegExp object created from config.excludeRegex defining additional excluded packages
 * @returns {object[]} with dependencies
 */
export function getDependencies(packageJson, exclusions, inclusions, exclusionRegex) {
  const depsIndex = [];
  const noDepsTypeDefined =
    isNullOrUndefined(inclusions) || !Array.isArray(inclusions) || inclusions.length === 0;
  if (
    (noDepsTypeDefined || inclusions.includes('prod')) &&
    packageJson.dependencies !== undefined
  ) {
    addPackagesToIndex(packageJson.dependencies, depsIndex, exclusions, exclusionRegex);
  }

  if (
    (noDepsTypeDefined || inclusions.includes('dev')) &&
    packageJson.devDependencies !== undefined
  ) {
    addPackagesToIndex(packageJson.devDependencies, depsIndex, exclusions, exclusionRegex);
  }

  if (
    (noDepsTypeDefined || inclusions.includes('peer')) &&
    packageJson.peerDependencies !== undefined
  ) {
    addPackagesToIndex(packageJson.peerDependencies, depsIndex, exclusions, exclusionRegex);
  }

  if (
    (noDepsTypeDefined || inclusions.includes('opt')) &&
    packageJson.optionalDependencies !== undefined
  ) {
    addPackagesToIndex(packageJson.optionalDependencies, depsIndex, exclusions, exclusionRegex);
  }

  return depsIndex;
}
