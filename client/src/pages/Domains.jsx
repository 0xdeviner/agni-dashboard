import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Typography, IconButton
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

export default function Domains() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);

  const load = async () => {
    const res = await api.get('/api/domains', { params: { page: page + 1, limit } }).then(r => r.data);
    setRows(res.items);
    setTotal(res.total);
  };

  useEffect(() => { load(); }, [page, limit]);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Domains</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Domain</TableCell>
              <TableCell align="right">Open</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d._id} hover>
                <TableCell>{d.domain}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => navigate(`/domains/${encodeURIComponent(d.domain)}`)}>
                    <OpenInNewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={2}>No domains.</TableCell></TableRow>
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
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </Paper>
  );
}