import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#00bcd4', '#263238', '#7c4dff', '#26a69a'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const s = await api.get('/api/stats').then(r => r.data);
      setStats(s);
      const rec = await api.get('/api/recent?limit=10').then(r => r.data);
      setRecent(rec);
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
                {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 2, height: 360 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Totals</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <RTooltip />
              <Bar dataKey="count" fill="#00bcd4" radius={[6, 6, 0, 0]} />
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