"use client";
import { createContext, useContext, useState, useEffect } from "react";

type BranchContextType = {
  branchId: string | null;
  setBranchId: (id: string) => void;
};

const BranchContext = createContext<BranchContextType>({
  branchId: null,
  setBranchId: () => {},
});

export function useBranch() {
  return useContext(BranchContext);
}

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branchId, setBranchIdState] = useState<string | null>(
    () => typeof window !== "undefined" ? sessionStorage.getItem("branchId") : null
  );

  useEffect(() => {
    if (branchId) sessionStorage.setItem("branchId", branchId);
  }, [branchId]);

  const setBranchId = (id: string) => {
    setBranchIdState(id);
    sessionStorage.setItem("branchId", id);
  };

  return (
    <BranchContext.Provider value={{ branchId, setBranchId }}>
      {children}
    </BranchContext.Provider>
  );
}