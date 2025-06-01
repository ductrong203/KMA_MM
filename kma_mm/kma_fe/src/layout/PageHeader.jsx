import React from 'react';
import { Typography, Box } from '@mui/material';

const PageHeader = ({
    title,
    icon,
    subtitle,
    variant = "h5",
    component = "h2",
    sx = {}
}) => {
    return (
        <Box sx={{ mb: 2, ...sx }}>
            <Typography
                variant={variant}
                component={component}
                sx={{
                    fontWeight: 200,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: subtitle ? 1 : 0
                }}
            >
                {icon && <span style={{ fontSize: '1em' }}>{icon}</span>}
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="body1" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};

export default PageHeader;