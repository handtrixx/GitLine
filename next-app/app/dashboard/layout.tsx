import React from 'react';
import Box from '@mui/material/Box';
import ModeSwitch from '@/app/components/ModeSwitch';
import Logout from '@/app/components/Logout';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack>
      <Box>
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              GitLine
            </Typography>

            <ModeSwitch />
            <Logout />
          </Toolbar>
        </AppBar>
      </Box>
      <Box>
        {children}
      </Box>
    </Stack>
  );
}