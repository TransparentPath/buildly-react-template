import _ from 'lodash'; // Import lodash for utility functions
import i18n from '../i18n/index';

/**
 * Validates if a required field is filled.
 * @param {Object} input - Contains `value` and `required` flag.
 * @returns {Object} - Validation result with error flag and message.
 */
const requiredValidator = (input) => {
  const { value, required } = input;
  // If the value is missing and field is required, return error
  if (!value && required) {
    return {
      error: true,
      message: i18n.t('validation.required'),
    };
  }
  // Otherwise, it's valid
  return { error: false, message: '' };
};

/**
 * Validates an email address format.
 * @param {Object} input - Contains `value` (email) and `required` flag.
 * @returns {Object} - Validation result with error flag and message.
 */
const emailValidator = (input) => {
  // eslint-disable-next-line no-useless-escape
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const { value, required } = input;
  // Check if the field is required and empty
  if (!value && required) {
    return {
      error: true,
      message: i18n.t('validation.required'),
    };
  }
  // Check if value exists and is not a valid email
  if (value && !pattern.test(value)) {
    return {
      error: true,
      message: i18n.t('validation.invalidEmail'),
    };
  }
  // Otherwise, valid
  return { error: false, message: '' };
};

/**
 * Validates if a confirmation field (e.g., password confirmation) matches the original.
 * @param {Object} input - Contains `value`, `password`, and `required` flag.
 * @returns {Object} - Validation result with error flag and message.
 */
const confirmValidator = (input) => {
  const { value, required, password } = input;
  // Required and empty
  if (!value && required) {
    return {
      error: true,
      message: i18n.t('validation.required'),
    };
  }
  // Value exists but doesn't match original
  if (value && value !== password) {
    return {
      error: true,
      message: i18n.t('validation.fieldMismatch'),
    };
  }
  return { error: false, message: '' };
};

/**
 * Validates a list of email addresses to ensure:
 * - None are empty (if required)
 * - All are valid emails
 * - No duplicates within the input array
 * - No duplicates against an `extra` array (already existing emails)
 *
 * @param {Object} input - Contains `value` (email array), `required` flag, and `extra` (existing emails)
 * @returns {Object} - Validation result
 */
const duplicateEmailValidator = (input) => {
  const { value, required, extra } = input;
  // eslint-disable-next-line no-useless-escape
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  // If the first element is empty and required, return error
  if (value[0] === '' && required) {
    return {
      error: true,
      message: i18n.t('validation.required'),
    };
  }
  // Check for invalid emails
  if (value.some((element) => !pattern.test(element))) {
    return {
      error: true,
      message: i18n.t('validation.invalidEmail'),
    };
  }
  // Normalize all emails to lowercase
  const lowerCaseValue = value.map((email) => email.toLowerCase());
  const lowerCaseExtra = extra.map((email) => email.toLowerCase());
  // Check for duplicates within the input array
  const hasDuplicateInValue = lowerCaseValue.some((email, index) => lowerCaseValue.indexOf(email) !== index);
  // Check for duplicates against already existing emails
  const hasDuplicateInExtra = lowerCaseValue.some((email) => lowerCaseExtra.includes(email));
  if (hasDuplicateInValue) {
    return {
      error: true,
      message: i18n.t('validation.duplicateEmail'),
    };
  }
  if (hasDuplicateInExtra) {
    return {
      error: true,
      message: i18n.t('validation.emailAlreadyRegistered'),
    };
  }
  return { error: false, message: '' };
};

/**
 * Validates for duplicate organization name in an existing list.
 * @param {Object} input - Contains `value`, `required`, and `extra` (existing names).
 * @returns {Object} - Validation result
 */
const duplicateOrgNameValidator = (input) => {
  const { value, required, extra } = input;
  // Required and empty
  if (!value && required) {
    return {
      error: true,
      message: i18n.t('validation.required'),
    };
  }
  // Check if value is already in existing names
  if (_.includes(extra, value.value)) {
    return {
      error: true,
      message: i18n.t('validation.duplicateOrgName'),
    };
  }
  return { error: false, message: '' };
};

/**
 * Validates for duplicate organization abbreviation in an existing list.
 * @param {Object} input - Contains `value`, `required`, and `extra` (existing abbreviations).
 * @returns {Object} - Validation result
 */
const duplicateOrgAbbValidator = (input) => {
  const { value, required, extra } = input;
  // Required and empty
  if (!value && required) {
    return {
      error: true,
      message: i18n.t('validation.required'),
    };
  }
  // Check if abbreviation already exists
  if (_.includes(extra, value.value)) {
    return {
      error: true,
      message: i18n.t('validation.duplicateOrgAbb'),
    };
  }
  return { error: false, message: '' };
};

/**
 * validators - A central validator function that routes to the appropriate validator
 *
 * @param {string} type - Type of validation to perform
 * @param {Object} input - Data required for validation (varies by validator)
 * @returns {Object} - Validation result
 */
export const validators = (type, input) => {
  switch (type) {
    case 'required':
      return requiredValidator(input);

    case 'email':
      return emailValidator(input);

    case 'confirm':
      return confirmValidator(input);

    case 'duplicateEmail':
      return duplicateEmailValidator(input);

    case 'duplicateOrgName':
      return duplicateOrgNameValidator(input);

    case 'duplicateOrgAbb':
      return duplicateOrgAbbValidator(input);

    default:
      return { error: false, message: '' }; // If validator type is unknown, assume valid
  }
};
