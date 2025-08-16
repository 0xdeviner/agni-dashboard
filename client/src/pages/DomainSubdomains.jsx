import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import {
  Paper, Typography, FormControlLabel, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Box, Button, Stack, Chip
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { downloadText } from '../utils/downloadText';

export default function DomainSubdomains() {
  const { domain } = useParams();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [isAlive, setIsAlive] = useState(false);
  const [hasTakeover, setHasTakeover] = useState(false);

  const params = useMemo(() => ({
    page: page + 1, limit,
    is_alive: isAlive ? 'true' : undefined,
    has_takeover: hasTakeover ? 'true' : undefined
  }), [page, limit, isAlive, hasTakeover]);

  const load = async () => {
    const res = await api.get(`/api/domains/${encodeURIComponent(domain)}/subdomains`, { params }).then(r => r.data);
    setRows(res.items);
    setTotal(res.total);
  };

  useEffect(() => { load(); }, [domain, page, limit, isAlive, hasTakeover]);

  const doExport = async () => {
    const res = await api.get('/api/export/subdomains', {
      params: { domain, is_alive: isAlive ? 'true' : undefined, has_takeover: hasTakeover ? 'true' : undefined },
      responseType: 'text'
    });
    downloadText(`${domain}-subdomains.txt`, res.data);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6">Subdomains: {domain}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel control={<Switch checked={isAlive} onChange={(e) => { setIsAlive(e.target.checked); setPage(0); }} />} label="Alive only" />
          <FormControlLabel control={<Switch checked={hasTakeover} onChange={(e) => { setHasTakeover(e.target.checked); setPage(0); }} />} label="Has takeover" />
          <Button onClick={doExport}>Export TXT</Button>
        </Stack>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
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
              <TableRow><TableCell colSpan={6}><Box sx={{ p: 2, color: 'text.secondary' }}>No subdomains.</Box></TableCell></TableRow>
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
        rowsPerPageOptions={[10, 20, 50, 100, 200]}
      />
    </Paper>
  );
}