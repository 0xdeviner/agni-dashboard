import React, { useState } from 'react';
import {
  AppBar, Box, Toolbar, Typography, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PublicIcon from '@mui/icons-material/Public';
import LanIcon from '@mui/icons-material/Lan';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard' },
    { label: 'Domains', icon: <PublicIcon />, to: '/domains' },
    { label: 'Subdomains', icon: <LanIcon />, to: '/subdomains' },
    { label: 'Takeovers', icon: <SecurityIcon />, to: '/takeovers' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" color="default" sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Agni Recon Dashboard
          </Typography>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.08)' }
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              selected={location.pathname.startsWith(item.to)}
              onClick={() => navigate(item.to)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: open ? `${drawerWidth}px` : 0, transition: 'margin .2s ease' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}