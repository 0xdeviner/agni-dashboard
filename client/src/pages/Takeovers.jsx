import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Typography, Chip, Button
} from '@mui/material';
import { downloadText } from '../utils/downloadText';

export default function Takeovers() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/takeovers', { params: { page: page + 1, limit } }).then(r => r.data);
      setRows(res.items);
      setTotal(res.total);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load takeovers');
    }
  };

  useEffect(() => { load(); }, [page, limit]);

  const doExport = async () => {
    const res = await api.get('/export/takeovers', { responseType: 'text' });
    downloadText('takeovers.txt', res.data);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Takeovers</Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Button variant="outlined" onClick={doExport} sx={{ mb: 2 }}>Export</Button>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Subdomain</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s._id} hover>
                <TableCell>{s.subdomain}</TableCell>
                <TableCell>{s.domain}</TableCell>
                <TableCell>{s.takeover ? <Chip size="small" label="Yes" color="secondary" /> : 'No'}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={3}>No takeovers.</TableCell></TableRow>
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