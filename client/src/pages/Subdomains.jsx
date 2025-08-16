import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import {
  Paper, Typography, Grid, TextField, FormControlLabel, Switch, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip
} from '@mui/material';
import { downloadText } from '../utils/downloadText';

export default function Subdomains() {
  const [domain, setDomain] = useState('');
  const [sub, setSub] = useState('');
  const [q, setQ] = useState('');
  const [isAlive, setIsAlive] = useState(false);
  const [hasTakeover, setHasTakeover] = useState(false);
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);

  const params = useMemo(() => ({
    domain: domain || undefined,
    subdomain: sub || undefined,
    q: q || undefined,
    status_code: status || undefined,
    is_alive: isAlive ? 'true' : undefined,
    has_takeover: hasTakeover ? 'true' : undefined,
    page: page + 1,
    limit
  }), [domain, sub, q, status, isAlive, hasTakeover, page, limit]);

  const search = async () => {
    const res = await api.get('/api/subdomains', { params }).then(r => r.data);
    setRows(res.items);
    setTotal(res.total);
  };

  useEffect(() => { search(); }, [page, limit]);

  const onApplyFilters = () => { setPage(0); search(); };

  const doExport = async () => {
    const res = await api.get('/api/export/subdomains', {
      params: { domain: domain || undefined, is_alive: isAlive ? 'true' : undefined, has_takeover: hasTakeover ? 'true' : undefined },
      responseType: 'text'
    });
    downloadText('subdomains.txt', res.data);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Search Subdomains</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Subdomain contains" value={sub} onChange={(e) => setSub(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField fullWidth label="Status code" value={status} onChange={(e) => setStatus(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Free text (q)" value={q} onChange={(e) => setQ(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControlLabel control={<Switch checked={isAlive} onChange={(e) => setIsAlive(e.target.checked)} />} label="Alive only" />
          <FormControlLabel control={<Switch checked={hasTakeover} onChange={(e) => setHasTakeover(e.target.checked)} />} label="Has takeover" />
        </Grid>
        <Grid item xs={12} md={8} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button onClick={onApplyFilters}>Apply Filters</Button>
          <Button color="secondary" onClick={doExport}>Export TXT</Button>
        </Grid>
      </Grid>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Domain</TableCell>
              <TableCell>Subdomain</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Server</TableCell>
              <TableCell>CDN</TableCell>
              <TableCell>Takeover</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((s) => {
              const status = s?.alive_data?.status_code;
              const title = s?.alive_data?.title;
              const server = s?.alive_data?.webserver;
              const cdn = s?.alive_data?.cdn_name;
              return (
                <TableRow key={s._id} hover>
                  <TableCell>{s.domain}</TableCell>
                  <TableCell>{s.subdomain}</TableCell>
                  <TableCell>{status ? <Chip size="small" label={status} color={status >= 200 && status < 400 ? 'success' : 'default'} /> : '-'}</TableCell>
                  <TableCell>{title || '-'}</TableCell>
                  <TableCell>{server || '-'}</TableCell>
                  <TableCell>{cdn || '-'}</TableCell>
                  <TableCell>{s.takeover ? <Chip size="small" label="Yes" color="secondary" /> : 'No'}</TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7}>No results.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50, 100, 200, 500]}
      />
    </Paper>
  );
}