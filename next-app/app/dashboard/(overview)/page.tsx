import { Suspense } from 'react';
import Box from '@mui/material/Box';
import StepperUi from '@/app/ui/stepper';

export default function Page() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '800px', width: '100%', padding: '16px' }}>
        <Box>
          <Suspense fallback={"Loading..."}>
            <StepperUi />
          </Suspense>
        </Box>
      </div>
    </main>
  );
}
