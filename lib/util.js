import fs from 'node:fs';

/**
 * Combine baseUrl with subPath to create a web uri
 * @param {string} baseUrl - web address (e.g. 'https://my.domain.com/base/')
 * @param {string} subPath - section to append to baseUrl (e.g. 'main')
 * @returns {string} resulting href
 */
export function joinUrlPath(baseUrl, subPath) {
  const result = baseUrl.endsWith('/') ? baseUrl : baseUrl.concat('/');
  if (subPath.startsWith('/')) {
    subPath = subPath.slice(1);
  }
  return result.concat(subPath);
}

/**
 * Get an object by asynchronously reading a file
 * @param {string} path - path of the json file
 * @returns {object} generated from the content of the file
 */
export async function readJson(path) {
  const data = await fs.promises.readFile(path);
  return JSON.parse(data);
}

/**
 * Is element null or undefined?
 * @param {any} element - element under inspection
 * @returns {boolean} true if element is null or undefined
 */
export function isNullOrUndefined(element) {
  return element === undefined || element === null;
}

/**
 * Get a nested object property by pathname (a dotted string).
 * Examples:
 * getNestedPropertyFromKeyString(data, ['foo.bar']); // returns value of 'data.foo.bar'.
 * getNestedPropertyFromKeyString(data, ['foo.bar[2].baz']); // returns value of 'data.foo.bar[2].baz',
 * if data.foo.bar is an array with at least 3 elements.
 * @param {object} obj - object containing the requested property
 * @param {string} keyPath - key used to address the property (e.g.'foo.bar.baz')
 * @returns {any} value of the requested property or undefined
 */
export function nestedPropertyValue(obj, keyPath) {
  let result;
  if (!keyPath.includes('.')) {
    result = obj[keyPath];
  } else {
    const keys = keyPath
      .replace(/\[([^[\]]*)\]/g, '.$1.') // change array index to dot separators
      .split('.')
      .filter((t) => t !== ''); // remove empty entries
    result = keys.reduce((prevValue, currKey) => prevValue?.[currKey] ?? undefined, obj);
  }
  return result;
}

export const helpText = `Generate a detailed report of the licenses of all projects dependencies.

Usage: license-report [options]

Options:
  --csvHeaders                          Add header row to csv output containing labels for all fields.
  
  --delimiter="|"                       Set delimiter for csv output (defaults to ",").

  --exclude=<name of 1 package>         Exclude a package from output (can be added multiple times).

  --html.cssFile=</a/b/c.css>           Use custom stylesheet for html output.

  --only={dev|prod}                     Output licenses from devDependencies or dependencies (defaults to both).

  --output={table|json|csv|html}        Select output format (defaults to json).

  --package=</path/to/package.json>     Use another package.json file (defaults to current project).

  --useNpmrc                            Use .npmrc file for uri of registries.

  --registry=<https://myregistry.com/>  Use private repository for information about packages (defaults to npmjs.org).

  --<field>.label=<new-label>           Set label for output field. Allowed field names are:
                                        department, relatedTo, name, licensePeriod, material, licenseType,
                                        link, remoteVersion, installedVersion, definedVersion, author, installedFrom,
                                        latestRemoteVersion, latestRemoteModified.

  --<field>.value=<new-value>           Set value for static output field. Allowed field names are:
                                        department, relatedTo, licensePeriod, material.
`;
