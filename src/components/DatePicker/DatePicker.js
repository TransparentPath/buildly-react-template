import React from 'react';
import _ from 'lodash'; // Utility library for deep checks and formatting
// MUI X Pickers for Date/Time functionality
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Adapter to use Dayjs with MUI Date Pickers
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Standard Date Picker
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'; // Date and Time Picker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Wrapper for internationalization and date adapters
import { TextField } from '@mui/material'; // MUI Input field used within pickers
import './DatePickerStyles.css'; // Custom styling

// Custom Popper props for the calendar dropdown
const popperProps = {
  className: 'popperSx', // Custom class to style popper
  popperOptions: {
    modifiers: [
      {
        // Prevent translation attribute from interfering with styles or layout
        name: 'preventTranslation',
        enabled: true,
        phase: 'write',
        fn: ({ state }) => {
          state.elements.popper.setAttribute('translate', 'no');
        },
      },
    ],
  },
};

/**
 * DatePickerComponent - A flexible date/time picker based on MUI X
 *
 * Props:
 * - selectedDate: The current selected date (as a Dayjs object or JavaScript Date)
 * - handleDateChange: Function to call when date is changed, receives a Date object
 * - label: Label text to show on the picker input
 * - hasTime: Boolean flag to determine if time should be included (DateTimePicker)
 * - disabled: If true, disables the picker input
 * - required: If true, makes the picker a required input
 * - dateFormat: The format string for the date (e.g., 'DD/MM/YYYY')
 * - timeFormat: The format string for the time (e.g., 'hh:mm A' or 'HH:mm')
 */
const DatePickerComponent = ({
  selectedDate,
  handleDateChange,
  label,
  hasTime,
  disabled,
  required,
  dateFormat,
  timeFormat,
}) => (
  <div className="datePickerRoot">
    {/* MUI's LocalizationProvider is required for date adapters like Dayjs */}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Conditionally render DateTimePicker if hasTime is true */}
      {hasTime ? (
        <DateTimePicker
          variant="inline" // Inline display (legacy prop, not always required)
          inputVariant="outlined" // Outlined TextField appearance (legacy prop)
          ampm={!!(timeFormat && _.includes(timeFormat, ' A'))} // Enable AM/PM format if ' A' exists in timeFormat
          fullWidth
          margin="normal"
          required={required}
          disabled={disabled}
          label={label}
          value={selectedDate}
          // When date is changed, extract JS Date from Dayjs and pass to handler
          onChange={(value, keyInput) => handleDateChange(value.$d)}
          inputFormat={`${dateFormat} ${timeFormat}`} // Combine date and time formats
          PopperProps={popperProps} // Custom Popper styling
          renderInput={(props) => (
            <TextField {...props} /> // Use TextField to render input field
          )}
        />
      ) : (
        <DatePicker
          autoOk // Automatically accept the date without clicking "OK" (legacy prop)
          fullWidth
          inputVariant="outlined"
          variant="inline"
          inputFormat={`${dateFormat}`} // Only date format here
          margin="normal"
          disabled={disabled}
          required={required}
          id="date-picker-inline"
          label={label}
          value={selectedDate}
          // Extract native Date from Dayjs and pass to callback
          onChange={(value, keyInput) => handleDateChange(value.$d)}
          KeyboardButtonProps={{
            'aria-label': 'change date', // Accessibility
          }}
          PopperProps={popperProps} // Apply custom dropdown styling
          renderInput={(props) => (
            <TextField {...props} />
          )}
        />
      )}
    </LocalizationProvider>
  </div>
);

export default DatePickerComponent;
