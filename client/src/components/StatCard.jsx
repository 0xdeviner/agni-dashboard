import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

export default function StatCard({ title, value, subtitle, color }) {
  return (
    <Paper elevation={2} sx={{ p: 2, background: 'linear-gradient(180deg,#121821, #0f141c)' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="h4" sx={{ color: color || 'primary.main' }}>{value}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Paper>
  );
}