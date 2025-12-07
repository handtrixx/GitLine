"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import MuiCard from '@mui/material/Card';

async function callEndpoint(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
}

export default function StepperUi() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [steps, setSteps] = React.useState([
    {
      label: 'Step 1: Check Evironment',
      description: `wil checkk`,
      content: null,
      api: "api/v1/status",
      response: null
    },
    {
      label: 'Create an ad group',
      description:
        'An ad group contains one or more ads which target a shared set of keywords.',
      content: null,
      api: "api/v1/export",
      response: null
    },
    {
      label: 'Create an ad',
      description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
      content: null,
      api: "api/v1/status",
      response: null
    },
    {
      label: 'Create an ad',
      description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
      content: null,
      api: "api/v1/cleanup",
      response: null
    },
  ]);

  // Initialize content for each step
  React.useEffect(() => {
    const updatedSteps = [...steps];
    
    // Step 0 content
    updatedSteps[0] = {
      ...updatedSteps[0],
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ mb: 2 }}>
            Checking your environment.
          </Typography>
          {loading && activeStep === 0 ? (
            <CircularProgress />
          ) : steps[0].response ? (
            <Alert severity="success">
              Success: {JSON.stringify(steps[0].response)}
            </Alert>
          ) : error && activeStep === 0 ? (
            <Alert severity="error">
              Error: {error}
            </Alert>
          ) : (
            <Button onClick={() => callEndpoint(0)}>Check</Button>
          )}
        </Box>
      )
    };
    
    // Add content for other steps similarly...
    updatedSteps[1] = {
      ...updatedSteps[1],
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Creating ad group...</Typography>
        </Box>
      )
    };
    
    updatedSteps[2] = {
      ...updatedSteps[2],
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Creating ad...</Typography>
        </Box>
      )
    };
    
    updatedSteps[3] = {
      ...updatedSteps[3],
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Cleaning up...</Typography>
        </Box>
      )
    };
    
    setSteps(updatedSteps);
  }, [loading, error, steps[0].response, activeStep]);

  const callEndpoint = async (stepIndex: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(steps[stepIndex].api, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the step with the response
      const updatedSteps = [...steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        response: data
      };
      setSteps(updatedSteps);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const maxSteps = steps.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <MuiCard>
    <Box sx={{ maxWidth: 400, flexGrow: 1 }}>
      <Paper
        square
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 50,
          pl: 2,
          bgcolor: 'background.default',
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{steps[activeStep].label}</Typography>
      </Paper>
      <Box sx={{ height: 255, maxWidth: 400, width: '100%', p: 2 }}>
        {steps[activeStep].content}
      </Box>
      <MobileStepper
        variant="text"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            Next
            {theme.direction === 'rtl' ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      />
    </Box>
    </MuiCard>
  );
}

/*
export function VerticalLinearStepper({ steps }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [stepResults, setStepResults] = React.useState<Map<number, StepResult>>(new Map());
  const [error, setError] = React.useState<string | null>(null);
  const [fileId, setFileId] = React.useState<string | null>(null);

  const handleNext = async (action: string, stepIndex: number) => {
    setLoading(true);
    setError(null);

    try {
      const url = fileId ? `${action}?fileId=${fileId}` : action;
      console.log('from index.tsx - fileId:', fileId, 'url:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
     

      if (data.fileId) {
         console.log(data);
        setFileId(data.fileId);
      }

      const result: StepResult = {
        success: true,
        data: data,
        message: `Step ${stepIndex + 1} completed successfully`
      };

      setStepResults(prev => new Map(prev).set(stepIndex, result));
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      const result: StepResult = {
        success: false,
        message: errorMessage
      };

      setStepResults(prev => new Map(prev).set(stepIndex, result));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const handleReset = () => {
    setActiveStep(0);
    setStepResults(new Map());
    setError(null);
  };

  return (

    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => {
          const stepResult = stepResults.get(index);

          return (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Last step</Typography>
                  ) : null
                }
                StepIconProps={{
                  completed: stepResult?.success,
                  error: stepResult?.success === false
                }}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>

                {stepResult && (
                  <Alert
                    severity={stepResult.success ? "success" : "error"}
                    icon={stepResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    {stepResult.message}
                    {stepResult.data && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Response: {JSON.stringify(stepResult.data)}
                      </Typography>
                    )}
                  </Alert>
                )}

                {error && index === activeStep && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleNext(step.action, index)}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Processing...' : index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0 || loading}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="h6">All steps completed successfully!</Typography>
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {stepResults.size} step(s) executed
          </Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }} variant="outlined">
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}
  */