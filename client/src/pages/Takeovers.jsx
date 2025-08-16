import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip } from '@mui/material';

export default function Takeovers() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);

  const load = async () => {
    const res = await api.get('/api/takeovers', { params: { page: page + 1, limit } }).then(r => r.data);
    setRows(res.items);
    setTotal(res.total);
  };

  useEffect(() => { load(); }, [page, limit]);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Potential Takeovers</Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Domain</TableCell>
              <TableCell>Subdomain</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>CDN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((s) => {
              const status = s?.alive_data?.status_code;
              const title = s?.alive_data?.title;
              const cdn = s?.alive_data?.cdn_name;
              return (
                <TableRow key={s._id} hover>
                  <TableCell>{s.domain}</TableCell>
                  <TableCell>{s.subdomain}</TableCell>
                  <TableCell>{status ? <Chip size="small" label={status} /> : '-'}</TableCell>
                  <TableCell>{title || '-'}</TableCell>
                  <TableCell>{cdn || '-'}</TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5}>No takeovers found.</TableCell></TableRow>
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