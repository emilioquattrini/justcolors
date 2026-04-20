import { createContext, useContext, useState, type ReactNode } from 'react';

interface TransitionContextType {
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  currentPath: '/',
  setCurrentPath: () => {},
});

export function useTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState('/');

  return (
    <TransitionContext.Provider value={{ currentPath, setCurrentPath }}>
      {children}
    </TransitionContext.Provider>
  );
}
