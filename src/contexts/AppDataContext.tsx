import React, { createContext, useContext, useState } from "react";

export interface Application {
  id: string;
  companyName: string;
  industry: string;
  loanAmount: number;
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendation: "Approve" | "Review" | "Reject";
  status: "Approved" | "Rejected" | "Pending" | "In Review";
  date: string;
  financials?: {
    revenue: number;
    netProfit: number;
    totalDebt: number;
    assets: number;
    liabilities: number;
    cashFlow: number;
  };
  fraudFlags?: string[];
  explanation?: string;
}

const SEED: Application[] = [
  { id: "APP-001", companyName: "TechVista Solutions", industry: "Technology", loanAmount: 5000000, score: 82, riskLevel: "Low", recommendation: "Approve", status: "Approved", date: "2026-03-12", financials: { revenue: 25000000, netProfit: 4500000, totalDebt: 3000000, assets: 20000000, liabilities: 8000000, cashFlow: 5000000 }, fraudFlags: [], explanation: "Strong financials with healthy profit margin and low debt ratio" },
  { id: "APP-002", companyName: "GreenField Agro", industry: "Agriculture", loanAmount: 2000000, score: 55, riskLevel: "Medium", recommendation: "Review", status: "In Review", date: "2026-03-11", financials: { revenue: 8000000, netProfit: 400000, totalDebt: 4500000, assets: 10000000, liabilities: 7000000, cashFlow: 200000 }, fraudFlags: [], explanation: "Application needs review — moderate risk indicators detected" },
  { id: "APP-003", companyName: "MetalForge Industries", industry: "Manufacturing", loanAmount: 10000000, score: 28, riskLevel: "High", recommendation: "Reject", status: "Rejected", date: "2026-03-10", financials: { revenue: 15000000, netProfit: -2000000, totalDebt: 14000000, assets: 12000000, liabilities: 15000000, cashFlow: -1000000 }, fraudFlags: ["Liabilities exceed assets", "Negative cash flow with high loan request"], explanation: "Loan rejected due to high debt ratio and negative profit margin" },
  { id: "APP-004", companyName: "UrbanNest Realty", industry: "Real Estate", loanAmount: 20000000, score: 71, riskLevel: "Low", recommendation: "Approve", status: "Approved", date: "2026-03-09", financials: { revenue: 50000000, netProfit: 8000000, totalDebt: 15000000, assets: 80000000, liabilities: 30000000, cashFlow: 10000000 }, fraudFlags: [], explanation: "Strong financials with healthy profit margin and low debt ratio" },
  { id: "APP-005", companyName: "QuickMart Retail", industry: "Retail", loanAmount: 3000000, score: 45, riskLevel: "Medium", recommendation: "Review", status: "Pending", date: "2026-03-08", financials: { revenue: 12000000, netProfit: 600000, totalDebt: 7000000, assets: 9000000, liabilities: 6000000, cashFlow: 800000 }, fraudFlags: [], explanation: "Application needs review — moderate risk indicators detected" },
  { id: "APP-006", companyName: "HealthPlus Pharma", industry: "Healthcare", loanAmount: 8000000, score: 88, riskLevel: "Low", recommendation: "Approve", status: "Approved", date: "2026-03-07", financials: { revenue: 40000000, netProfit: 12000000, totalDebt: 5000000, assets: 35000000, liabilities: 10000000, cashFlow: 15000000 }, fraudFlags: [], explanation: "Strong financials with healthy profit margin and low debt ratio" },
  { id: "APP-007", companyName: "EduBridge Academy", industry: "Education", loanAmount: 1500000, score: 62, riskLevel: "Medium", recommendation: "Review", status: "In Review", date: "2026-03-06", financials: { revenue: 5000000, netProfit: 300000, totalDebt: 3000000, assets: 4000000, liabilities: 2500000, cashFlow: 400000 }, fraudFlags: [], explanation: "Application needs review — moderate risk indicators detected" },
  { id: "APP-008", companyName: "SkyLogistics", industry: "Logistics", loanAmount: 6000000, score: 35, riskLevel: "High", recommendation: "Reject", status: "Rejected", date: "2026-03-05", financials: { revenue: 10000000, netProfit: -500000, totalDebt: 9000000, assets: 7000000, liabilities: 8000000, cashFlow: -300000 }, fraudFlags: ["Liabilities exceed assets"], explanation: "Loan rejected due to high debt ratio and negative profit margin" },
];

interface AppDataContextType {
  applications: Application[];
  addApplication: (app: Application) => void;
}

const AppDataContext = createContext<AppDataContextType>({ applications: [], addApplication: () => {} });

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(SEED);
  const addApplication = (app: Application) => setApplications((prev) => [app, ...prev]);
  return <AppDataContext.Provider value={{ applications, addApplication }}>{children}</AppDataContext.Provider>;
};
