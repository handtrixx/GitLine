import { signOut } from '@/auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';

export default function ModeSwitch() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-end',
              
            }}
        >
            <form
                action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/' });
                }}
            >
               
                <IconButton aria-label="delete" type="submit">
                    <LogoutIcon fontSize="inherit" />
                </IconButton>
            </form>
        </Box>
    )
}