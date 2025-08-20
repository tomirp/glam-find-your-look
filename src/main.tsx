// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


// PERBAIKAN UTAMA: Tambahkan opsi default untuk menonaktifkan refresh saat fokus
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // <-- Baris ini akan menghentikan refresh otomatis
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  {/* --- BUNGKUS ThemeProvider DENGAN QueryClientProvider --- */}
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="glamfind-theme">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);