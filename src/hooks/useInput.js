import { useState } from 'react'; // Import React's useState hook for managing component state
import _ from 'lodash'; // Import lodash library for utility functions such as deep comparison

/**
 * Custom hook for managing form input state along with validation and utility helpers.
 *
 * @param {any} initialValue - The initial value of the input. Default is an empty string.
 * @param {Object} validators - Optional validators object. Common keys: required, confirm, matchField.
 *
 * @returns {Object} An object containing:
 *   - value: Current input value
 *   - required: Boolean flag if input is required
 *   - confirm: Boolean flag if this is a confirm field (e.g., confirm password)
 *   - matchField: Value of the field this input should match (if applicable)
 *   - bind: Object for easily spreading into input props (onChange, value, etc.)
 *   - clear: Function to clear input value
 *   - reset: Function to reset input to initial value
 *   - hasChanged: Function that checks if input has changed from initial value
 *   - setValue: Function to manually set the input value
 */
export const useInput = (
  initialValue = '', // Default value for the input field
  validators = {}, // Optional validators (e.g., required, confirm, matchField)
) => {
  // Local state to hold the current value of the input
  const [value, setValue] = useState(initialValue);

  return {
    value, // Current value of the input
    required: validators.required, // Whether the field is required (used for validation/UI indicators)
    confirm: validators.confirm, // Whether this input is a "confirm" field (e.g., confirm password)
    // Conditionally adds matchField (used for validation against another field)
    ...(validators.confirm
      && validators.matchField
      && { matchField: validators.matchField.value }
    ),
    // `bind` object makes it easier to spread input props like:
    // <input {...bind} /> or <TextField {...bind} />
    bind: {
      onChange: (e) => setValue(e.target.value), // Handles input changes by updating local state
      value, // Bind current value to input
      required: validators.required, // Carry over the required flag
    },
    clear: () => setValue(''), // Clears the input value (sets it to an empty string)
    reset: () => setValue(initialValue), // Resets the input to the original initial value
    // Checks whether the current value is different from the initial value
    // Handles type conversion for numbers and does deep comparison using lodash
    hasChanged: () => {
      let newValue = value;
      // If the initial value is a number, ensure type match for comparison
      if (typeof initialValue === 'number') {
        newValue = Number(value);
      }
      // Return true if current value is not equal to the initial value
      return !_.isEqual(initialValue, newValue);
    },
    // Expose the raw `setValue` method for manual control if needed
    setValue,
  };
};
