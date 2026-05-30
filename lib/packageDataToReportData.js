import { nestedPropertyValue } from './util.js';

/**
 * Create object with all fields listed in config.fields with current values about one package.
 * Only fields from the field list will be returned in the generated object.
 * If there is no value for a field in 'packageData', then the value is taken from the corresponding
 * entry in the config file (e.g. from config.material.value for the 'material' field).
 * @param {object} packageData - object with information about one package (fields are e.g. 'name', 'licenseType', 'link', 'remoteVersion', 'installedVersion', 'author')
 * @param {object} config - global configuration object
 * @returns {object} object with all fields listed in config.fields
 */
export function packageDataToReportData(packageData, config) {
  const fieldsList = Array.isArray(config.fields) ? config.fields : [config.fields];
  const finalData = {};

  // create only fields specified in the config
  fieldsList.forEach((fieldName) => {
    if (fieldName in packageData) {
      finalData[fieldName] = packageData[fieldName];
    } else {
      let value = 'n/a';
      const fieldDefinition = nestedPropertyValue(config, fieldName);
      if (fieldDefinition?.value !== undefined) {
        value = fieldDefinition.value;
      }

      finalData[fieldName] = value;
    }
  });

  return finalData;
}
