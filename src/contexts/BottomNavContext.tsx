// src/contexts/BottomNavContext.tsx

import { createContext, useState, useContext, ReactNode } from 'react';

interface BottomNavContextType {
  isBottomNavVisible: boolean;
  setBottomNavVisible: (visible: boolean) => void;
}

const BottomNavContext = createContext<BottomNavContextType | undefined>(undefined);

export const BottomNavProvider = ({ children }: { children: ReactNode }) => {
  const [isBottomNavVisible, setBottomNavVisible] = useState(true);

  return (
    <BottomNavContext.Provider value={{ isBottomNavVisible, setBottomNavVisible }}>
      {children}
    </BottomNavContext.Provider>
  );
};

export const useBottomNav = () => {
  const context = useContext(BottomNavContext);
  if (context === undefined) {
    throw new Error('useBottomNav must be used within a BottomNavProvider');
  }
  return context;
};