import React from 'react';
import {
  Stepper,
  Step,
  StepConnector,
  StepContent,
  StepLabel,
  styled,
  Stack,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import { CircleRounded as CircleIcon, CheckCircleRounded as CheckIcon } from '@mui/icons-material';

const CustomizedConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.success.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.success.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.background.light,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const CustomizedStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  color: theme.palette.background.light,
  display: 'flex',
  height: 30,
  alignItems: 'center',
  ...(ownerState.active && {
    color: theme.palette.success.main,
  }),
  '& .icon': {
    color: 'currentColor',
    zIndex: 1,
  },
}));

const CustomizedStepIcon = (props) => {
  const { active, completed, className } = props;

  return (
    <CustomizedStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <CheckIcon className="icon" />
      ) : (
        <CircleIcon className="icon" />
      )}
    </CustomizedStepIconRoot>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: `${theme.spacing(2)} 0`,
  },
  noLine: {
    '& .MuiStepConnector-root:first-of-type': {
      display: 'none',
    },
  },
}));

const CustomizedSteppers = ({ steps }) => {
  const classes = useStyles();

  return (
    <Stepper alternativeLabel connector={<CustomizedConnector />} className={classes.root}>
      {steps.map((step, index) => (
        <Stack key={index} sx={{ flex: 1 }}>
          <Typography textAlign="center" fontWeight={700} pb={2} pl={1} pr={1} fontSize={14}>{step.title}</Typography>
          <Step active={step.active} completed={step.completed} className={index === 0 ? classes.noLine : ''}>
            <StepLabel StepIconComponent={CustomizedStepIcon}>{step.label}</StepLabel>
            <StepContent style={{ textAlign: 'center', border: 0 }}>
              {step.active ? step.content : ''}
            </StepContent>
          </Step>
        </Stack>
      ))}
    </Stepper>
  );
};

export default CustomizedSteppers;
