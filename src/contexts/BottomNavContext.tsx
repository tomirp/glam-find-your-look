// src/contexts/BottomNavContext.tsx

import { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface BottomNavContextType {
  isBottomNavVisible: boolean;
  setBottomNavVisible: (visible: boolean) => void;
}

const BottomNavContext = createContext<BottomNavContextType | undefined>(undefined);

export const useBottomNav = () => {
  const context = useContext(BottomNavContext);
  if (context === undefined) {
    throw new Error('useBottomNav must be used within a BottomNavProvider');
  }
  return context;
};

export const BottomNavProvider = ({ children }: { children: React.ReactNode }) => {
  const [isBottomNavVisible, setBottomNavVisibleState] = useState(true);

  // --- PERBAIKAN DI SINI ---
  // Bungkus fungsi dengan useCallback agar referensinya stabil
  const setBottomNavVisible = useCallback((visible: boolean) => {
    setBottomNavVisibleState(visible);
  }, []);

  // Gunakan useMemo untuk memastikan objek 'value' tidak dibuat ulang
  // di setiap render kecuali dependensinya berubah.
  const value = useMemo(() => ({
    isBottomNavVisible,
    setBottomNavVisible,
  }), [isBottomNavVisible, setBottomNavVisible]);
  // -------------------------

  return (
    <BottomNavContext.Provider value={value}>
      {children}
    </BottomNavContext.Provider>
  );
};