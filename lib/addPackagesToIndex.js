/**
 * Add information about all packages from one of the dependencies (e.g. 'devDependencies') to
 * an array ('packageIndex'), while maintaining uniqueness (crudely).
 * For each package the following information is added: 'name', 'fullName', 'alias', 'version', 'scope'
 * @param {object} packages - object with dependencies from a package.json (e.g. value of 'dependencies' or 'devDependencies')
 * @param {object[]} packageIndex - array, the information about the packages are added to ('package index') - input/output value!
 * @param {string[]} exclusions - exclusions list from config object
 * @param {object} exclusionRegex - RegExp object created from config.excludeRegex defining additional excluded packages
 */
export function addPackagesToIndex(packages, packageIndex, exclusions, exclusionRegex) {
  exclusions = exclusions ?? [];

  // iterate over packages and prepare urls before I call the registry
  for (const key in packages) {
    if (exclusions.includes(key) || exclusionRegex?.test(key)) {
      continue;
    }

    let name = key;
    let fullName = key;
    let alias = '';
    let version = packages[key];
    if (version.startsWith('npm:')) {
      alias = fullName;
      const aliasBase = version.substring(4);
      const versionSeparator = aliasBase.lastIndexOf('@');
      fullName = aliasBase.substring(0, versionSeparator);
      name = fullName;
      version = aliasBase.substring(versionSeparator + 1);
    }

    let scope;
    if (name.indexOf('@') === 0) {
      const scopeSeparator = name.indexOf('/');
      scope = name.substring(1, scopeSeparator);
      name = name.substring(scopeSeparator + 1, name.length);
    }

    const newEntry = {
      fullName: fullName,
      alias: alias,
      name: name,
      version: version,
      scope: scope,
    };

    const indexOfNewEntry = packageIndex.findIndex(
      (entry) =>
        entry.name === newEntry.name &&
        entry.version === newEntry.version &&
        entry.scope === newEntry.scope,
    );

    if (indexOfNewEntry === -1) {
      packageIndex.push(newEntry);
    }
  }
}
