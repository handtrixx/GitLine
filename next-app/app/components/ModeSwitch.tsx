'use client';
import { useState } from 'react';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ComputerIcon from '@mui/icons-material/Computer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';

export default function ModeSwitch() {
  const { mode, setMode } = useColorScheme();
  
  if (!mode) {
    return null;
  }

  const getNextMode = () => {
    if (mode === 'system') return 'light';
    if (mode === 'light') return 'dark';
    return 'system';
  };

  const getModeIcon = () => {
    if (mode === 'system') return <ComputerIcon />;
    if (mode === 'light') return <Brightness7Icon />;
    return <Brightness4Icon />;
  };

  const getModeTooltip = () => {
    if (mode === 'system') return 'System Theme';
    if (mode === 'light') return 'Light Theme';
    return 'Dark Theme';
  };

  return (
    <Tooltip title={`Switch to ${getNextMode()} mode`}>
      <IconButton
        onClick={() => setMode(getNextMode())}
        color="inherit"
        aria-label="toggle theme"
        sx={{ 
          ml: "auto",
          mr: 1,
         
        }}
      >
        {getModeIcon()}
      </IconButton>
    </Tooltip>
  );
}