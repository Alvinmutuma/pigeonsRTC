import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivacyPolicy from './legal/PrivacyPolicy';
import TermsOfService from './legal/TermsOfService';
import Security from './legal/Security';
import CookiePolicy from './legal/CookiePolicy';
import '../styles/LegalPages.css';

const Legal = () => {
  return (
    <Routes>
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      <Route path="terms-of-service" element={<TermsOfService />} />
      <Route path="security" element={<Security />} />
      <Route path="cookie-policy" element={<CookiePolicy />} />
      <Route path="*" element={<Navigate to="/legal/privacy-policy" replace />} />
    </Routes>
  );
};

export default Legal;
