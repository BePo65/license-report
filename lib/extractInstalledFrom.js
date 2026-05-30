/**
 * Extract installation source file from registry data for a package
 * @param {object} json - object fetched from registry with information about 1 package
 * @returns {string} with link to installation source
 */
export function extractInstalledFrom(json) {
  if (json.dist?.tarball) {
    return json.dist.tarball;
  }

  return;
}
