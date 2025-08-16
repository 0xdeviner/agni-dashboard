import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import DomainSubdomains from './pages/DomainSubdomains';
import Subdomains from './pages/Subdomains';
import Takeovers from './pages/Takeovers';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/domains/:domain" element={<DomainSubdomains />} />
          <Route path="/subdomains" element={<Subdomains />} />
          <Route path="/takeovers" element={<Takeovers />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}