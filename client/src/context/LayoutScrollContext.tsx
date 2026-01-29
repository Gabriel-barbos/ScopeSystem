import { createContext, useContext, ReactNode, useState } from "react";

interface LayoutScrollContextType {
  disableScroll: boolean;
  setDisableScroll: (disable: boolean) => void;
}

const LayoutScrollContext = createContext<LayoutScrollContextType | undefined>(
  undefined
);

export function LayoutScrollProvider({ children }: { children: ReactNode }) {
  const [disableScroll, setDisableScroll] = useState(false);

  return (
    <LayoutScrollContext.Provider value={{ disableScroll, setDisableScroll }}>
      {children}
    </LayoutScrollContext.Provider>
  );
}

export function useLayoutScroll() {
  const context = useContext(LayoutScrollContext);
  if (context === undefined) {
    throw new Error("useLayoutScroll must be used within LayoutScrollProvider");
  }
  return context;
}