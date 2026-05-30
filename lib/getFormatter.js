import fs from 'node:fs';
import tableify from '@kessler/tableify';
import { tablemark } from 'tablemark';
import table from 'text-table';
import { isNullOrUndefined, nestedPropertyValue } from './util.js';

/**
 * Formats package information as json string.
 * @param {object[]} dataAsArray - array of objects with information about dependencies / devDependencies in package.json
 * @param {object} config - global configuration object
 * @returns {string} dataAsArray formatted as json string
 */
// eslint-disable-next-line no-unused-vars
function formatAsJsonString(dataAsArray, _config) {
  return JSON.stringify(dataAsArray);
}

/**
 * Formats package information as table.
 * @param {object[]} dataAsArray - array of objects with information about dependencies / devDependencies in package.json
 * @param {object} config - global configuration object
 * @returns {string} dataAsArray formatted as table string
 */
function formatAsTable(dataAsArray, config) {
  const fieldsList = Array.isArray(config.fields) ? config.fields : [config.fields];
  const data = arrayOfObjectsToArrayOfArrays(dataAsArray);
  const labels = [];
  const lines = [];

  // create a labels array and a lines array
  // the lines will be the same length as the label's
  for (let i = 0; i < fieldsList.length; i++) {
    let label = fieldsList[i];
    const fieldDefinition = nestedPropertyValue(config, fieldsList[i]);
    if (fieldDefinition?.label !== undefined) {
      label = fieldDefinition.label;
    }

    labels.push(label);
    lines.push('-'.repeat(label.length));
  }

  data.unshift(lines);
  data.unshift(labels);

  return table(data);
}

/**
 * Formats package information as csv string.
 * The names of the properties are used as column headers (if config.csvHeaders is true).
 * @param {object[]} dataAsArray - array of objects with information about dependencies / devDependencies in package.json
 * @param {object} config - global configuration object
 * @returns {string} dataAsArray formatted as csv string
 */
function formatAsCsv(dataAsArray, config) {
  const fieldsList = Array.isArray(config.fields) ? config.fields : [config.fields];
  const data = arrayOfObjectsToArrayOfArrays(dataAsArray);
  const csv = [];
  const delimiter = config.delimiter;
  const escapeFields = config.escapeCsvFields;

  if (config.csvHeaders) {
    const labels = [];
    // create a labels array and a lines array
    for (let i = 0; i < fieldsList.length; i++) {
      labels.push(config[fieldsList[i]].label);
    }
    csv.push(labels.join(delimiter));
  }

  for (const element of data) {
    const validatedFields = element.map((fieldValue) => {
      let validatedField = fieldValue;
      if (fieldValue.includes(delimiter)) {
        console.warn(`Warning: field contains delimiter; value: "${fieldValue}"`);
        if (escapeFields) {
          validatedField = `"${fieldValue}"`;
        }
      }
      return validatedField;
    });

    csv.push(validatedFields.join(delimiter));
  }

  return csv.join('\n');
}

/**
 * Formats package information as html. The names of the properties are used as column headers.
 * To use the labels of the properties set in config as headers, the properties are renamed.
 * @param {object[]} dataAsArray - array of objects with information about dependencies / devDependencies in package.json
 * @param {object} config - global configuration object
 * @returns {string} dataAsArray formatted as html
 */
function formatAsHTML(dataAsArray, config) {
  let rowsToBeDisplayed;
  if (dataAsArray.length > 0) {
    rowsToBeDisplayed = dataAsArray.map((row) => {
      const resultObject = renameRowsProperties(row, config);
      // For every string property of row: escape characters that could be interpreted as html tags
      for (const key in resultObject) {
        if (typeof resultObject[key] === 'string') {
          resultObject[key] = escapeHtml(resultObject[key]);
        }
      }

      return resultObject;
    });
  } else {
    rowsToBeDisplayed = [dataArrayWithEmptyRow(config)];
  }

  return tableify.htmlDoc(
    rowsToBeDisplayed,
    config.html.tableify,
    fs.readFileSync(config.html.cssFile),
  );
}

/**
 * Formats package information as a markdown table. The names of the properties are used as column headers.
 * @param {object[]} dataAsArray - array of objects with information about dependencies / devDependencies in package.json
 * @param {object} config - global configuration object
 * @returns {string} dataAsArray formatted as a markdown table
 */
function formatAsMarkdown(dataAsArray, config) {
  let result = '';
  if (dataAsArray.length > 0) {
    // Respect the possibly overridden field names
    const dataAsArrayWithRenamedFields = dataAsArray.map((row) =>
      renameRowsProperties(row, config),
    );
    result = tablemark(dataAsArrayWithRenamedFields, config.tablemarkOptions);
  }

  return result;
}

/**
 * Gets the formatter function for the style given.
 * Allowed styles: 'json', 'table', 'csc'.
 * Function signature: function(dataAsArray, config)
 * dataAsArray: array of objects with information about dependencies / devDependencies in package.json,
 * config: global configuration object
 * @param {string} style - output style to be generated
 * @returns {function(object[], object)} function to format the data; signature: function(dataAsArray, config)
 */
export function getFormatter(style) {
  let formatter;
  switch (style) {
    case 'json':
      formatter = formatAsJsonString;
      break;
    case 'table':
      formatter = formatAsTable;
      break;
    case 'csv':
      formatter = formatAsCsv;
      break;
    case 'html':
      formatter = formatAsHTML;
      break;
    case 'markdown':
      formatter = formatAsMarkdown;
      break;
    default:
      throw new Error('invalid output format in config');
  }

  return formatter;
}

/**
 * Convert an array of objects to an array of arrays
 * @param {object[]} arrayOfObjects - array of objects to be converted
 * @returns {string[][]} converted array
 */
function arrayOfObjectsToArrayOfArrays(arrayOfObjects) {
  const arrayOfArrays = arrayOfObjects.map((objectElement) => {
    const objectAsArray = Object.values(objectElement);
    return objectAsArray.map((arrayElement) =>
      !isNullOrUndefined(arrayElement) ? arrayElement : 'n/a',
    );
  });
  return arrayOfArrays;
}

/**
 * Rename the property of an object
 * @param {string} oldProp - old name of the property
 * @param {string} newProp - new name of the property
 * @param {string} old - value of the old property
 * @returns {object} object with the renamed property
 */
function renameProp(oldProp, newProp, { [oldProp]: old, ...others }) {
  const newObject = { [newProp]: old, ...others };
  return newObject;
}

/**
 * Rename each property of row with the value of its label from config
 * @param {object} row - object with data of one row to be displayed
 * @param {object} config - configuration object
 * @returns {object} row with renamed properties
 */
function renameRowsProperties(row, config) {
  const fieldsList = Array.isArray(config.fields) ? config.fields : [config.fields];
  let renamedRow = row;
  for (let i = fieldsList.length - 1; i >= 0; i--) {
    const fieldname = fieldsList[i];
    let newFieldname = fieldname;
    const fieldDefinition = nestedPropertyValue(config, fieldname);
    if (fieldDefinition?.label !== undefined) {
      newFieldname = fieldDefinition.label;
    }

    renamedRow = renameProp(fieldname, newFieldname, renamedRow);
  }
  return renamedRow;
}

/**
 * Create an object with one property for every field listed in config.fields;
 * the properties value is always an empty space character
 * The order of the fields is inverse, as renameRowsProperties used in formatAsHTML
 * reverses the order of the fields in the object
 * @param {object} config - configuration object
 * @returns {object} dummy entry with one space as value
 */
function dataArrayWithEmptyRow(config) {
  const fieldsList = Array.isArray(config.fields) ? config.fields : [config.fields];
  const emptyRow = {};
  // create an array with 1 line of empty entries, to display empty table with header
  for (let i = fieldsList.length - 1; i >= 0; i--) {
    const label = config[fieldsList[i]].label;
    emptyRow[label] = ' ';
  }
  return emptyRow;
}

/**
 *
 * @param {string} unsafeString - string with characters that could be interpreted as html tag
 * @returns unsafeString with all dangerous characters replaced with html entities
 */
const escapeHtml = (unsafeString) => {
  return unsafeString
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};
