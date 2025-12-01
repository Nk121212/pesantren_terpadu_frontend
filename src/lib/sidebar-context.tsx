"use client";

import { createContext, useContext, useState } from "react";

type SidebarContextType = {
  open: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  open: true,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ open, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
