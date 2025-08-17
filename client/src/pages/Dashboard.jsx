import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Grid, Paper, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // baseURL handles '/api'
        const s = await api.get('/stats').then(r => r.data);
        setStats(s);
        const rec = await api.get('/recent', { params: { limit: 10 } }).then(r => r.data);
        setRecent(rec);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load dashboard');
      }
    })();
  }, []);

  const pieData = stats ? [
    { name: 'Alive', value: stats.live_subdomains },
    { name: 'Not Alive', value: Math.max(stats.subdomains - stats.live_subdomains, 0) }
  ] : [];

  const barData = stats ? [
    { name: 'Subdomains', count: stats.subdomains },
    { name: 'Takeovers', count: stats.takeovers }
  ] : [];

  return (
    <Grid container spacing={2}>
      {error && (
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, color: 'error.main' }}>{error}</Paper>
        </Grid>
      )}

      <Grid item xs={12} md={3}><StatCard title="Domains" value={stats?.domains ?? '—'} /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Subdomains" value={stats?.subdomains ?? '—'} /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Alive Subdomains" value={stats?.live_subdomains ?? '—'} /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Takeovers" value={stats?.takeovers ?? '—'} color="#7c4dff" /></Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 2, height: 360 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Alive vs Not Alive</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={120} label>
                <Cell key="alive" fill="#00c853" />
                <Cell key="dead" fill="#263238" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 2, height: 360 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Counts</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#26a69a" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Recent Subdomains</Typography>
          <List dense>
            {recent.map((s) => {
              const status = s?.alive_data?.status_code;
              return (
                <ListItem key={s._id} divider>
                  <ListItemText primary={s.subdomain} secondary={s.domain} />
                  {status && <Chip size="small" label={status} color={status >= 200 && status < 400 ? 'success' : 'default'} sx={{ ml: 1 }} />}
                  {s.takeover && <Chip size="small" label="Takeover" color="secondary" sx={{ ml: 1 }} />}
                </ListItem>
              );
            })}
            {recent.length === 0 && <Box sx={{ p: 2, color: 'text.secondary' }}>No recent items.</Box>}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}