import React from 'react';
// Material UI components used for stepper layout and styling
import {
  Stepper,
  Step,
  StepConnector,
  StepLabel,
  Stack,
  Typography,
  StepIcon,
} from '@mui/material';
import { CircleRounded as CircleIcon, CheckCircleRounded as CheckIcon } from '@mui/icons-material'; // Icons for step states (active/completed)
import './CustomizedStepperStyles.css'; // Custom styles for stepper appearance

const CustomizedSteppers = ({ steps }) => {
  /**
   * Determines the appropriate icon and style for a step
   * based on its state: active, completed, error, info, or default.
   *
   * @param {Object} step - Step object containing state flags
   * @returns JSX.Element - Icon component with appropriate styling class
   */
  const getIcon = (step) => {
    switch (true) {
      // Active but not completed step
      case step.active && !step.completed:
        return <CircleIcon className="customizedStepperActive" />;
      // Active and completed step
      case step.active && step.completed:
        return <CheckIcon className="customizedStepperActive" />;
      // Step with an error and not completed
      case step.error && !step.completed:
        return <CircleIcon className="customizedStepperError" />;
      // Step with an error and completed
      case step.error && step.completed:
        return <CheckIcon className="customizedStepperError" />;
      // Informational step (custom condition) and not completed
      case step.info && !step.completed:
        return <CircleIcon className="customizedStepperInfo" />;
      // Informational step and completed
      case step.info && step.completed:
        return <CheckIcon className="customizedStepperInfo" />;
      // Default (inactive, not started) state
      default:
        return <CircleIcon className="customizedStepperDefault" />;
    }
  };

  return (
    // Main Stepper component with horizontal layout and custom connector
    <Stepper
      alternativeLabel
      connector={<StepConnector className="customizedStepperConnector" />}
      className="customizedStepperRoot"
    >
      {/* Loop through the steps passed as props */}
      {steps.map((step, index) => (
        // Use Stack to allow vertical stacking of title/icon/step content
        <Stack key={index} sx={{ flex: 1 }}>
          {/* Step title row (can include optional icon and styled text) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignSelf: 'center' }}>
            {/* Optional title icon */}
            {step.titleIcon}
            <Typography
              className={step.titleIcon ? '' : 'notranslate'} // Prevent translation if plain text
              textAlign="center"
              fontWeight={700}
              pb={2}
              pl={step.titleIcon ? 1 : 0} // Padding only if icon exists
              pr={1}
              fontSize={14}
              color={step.titleColor} // Optional custom color
            >
              {step.title}
            </Typography>
          </div>
          {/* Each Step with optional line removal for the first step */}
          <Step className={index === 0 ? 'customizedStepperNoLine' : ''}>
            {/* Custom icon determined by state */}
            <StepIcon icon={getIcon(step)} />
            {/* Label for the step (shown under the icon) */}
            <StepLabel>{step.label}</StepLabel>
            {/* Main content of the step (usually a description or message) */}
            <Typography
              className="notranslate"
              textAlign="center"
              fontSize={14}
              style={{ width: 'max-content', margin: 'auto' }}
            >
              {step.content}
            </Typography>
            {/* Optional caption displayed below the content */}
            <Typography textAlign="center" fontSize={14}>
              {step.caption}
            </Typography>
          </Step>
        </Stack>
      ))}
    </Stepper>
  );
};

export default CustomizedSteppers;
