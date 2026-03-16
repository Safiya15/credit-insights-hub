import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { calculateCreditScore } from "@/lib/creditScoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Printer, Download, Building2, TrendingUp, ShieldCheck, AlertTriangle, BarChart3, FileText, Bot } from "lucide-react";
import AIUnderwriterChat from "@/components/AIUnderwriterChat";

const fmt = (n: number) => `₹${(n / 100000).toFixed(2)}L`;
const fmtCr = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)}Cr` : fmt(n);

const CAMReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications } = useAppData();
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const app = applications.find((a) => a.id === id);

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold">Application Not Found</h1>
        <Button onClick={() => navigate("/applications")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
        </Button>
      </div>
    );
  }

  const fin = app.financials || { revenue: 0, netProfit: 0, totalDebt: 0, assets: 0, liabilities: 0, cashFlow: 0 };
  const scoring = calculateCreditScore({ ...fin, loanAmount: app.loanAmount });

  const handlePrint = () => window.print();

  const riskBg = scoring.riskLevel === "Low" ? "bg-risk-low text-risk-low-foreground" : scoring.riskLevel === "Medium" ? "bg-risk-medium text-risk-medium-foreground" : "bg-risk-high text-risk-high-foreground";
  const riskBorder = scoring.riskLevel === "Low" ? "border-risk-low/30" : scoring.riskLevel === "Medium" ? "border-risk-medium/30" : "border-risk-high/30";
  const riskText = scoring.riskLevel === "Low" ? "text-risk-low" : scoring.riskLevel === "Medium" ? "text-risk-medium" : "text-risk-high";

  const today = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  // Derived financial metrics
  const currentRatio = fin.liabilities > 0 ? (fin.assets / fin.liabilities).toFixed(2) : "N/A";
  const debtEquity = (fin.assets - fin.liabilities) > 0 ? (fin.totalDebt / (fin.assets - fin.liabilities)).toFixed(2) : "N/A";
  const returnOnAssets = fin.assets > 0 ? ((fin.netProfit / fin.assets) * 100).toFixed(1) : "0";
  const interestCoverage = fin.totalDebt > 0 ? (fin.cashFlow / (fin.totalDebt * 0.1)).toFixed(2) : "N/A";
  const netWorth = fin.assets - fin.liabilities;
  const workingCapital = fin.assets * 0.4 - fin.liabilities * 0.3; // simplified estimation

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Controls - hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => navigate("/applications")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Printable Report */}
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* Report Header */}
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Credit Appraisal Memorandum</h1>
              </div>
              <p className="text-sm text-muted-foreground">Confidential — For Internal Use Only</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Report ID: CAM-{app.id}</p>
              <p>Date: {today}</p>
              <p>Prepared by: {user?.name || "System"}</p>
            </div>
          </div>
        </Card>

        {/* Section 1: Borrower Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">1. Borrower Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Company Name</span>
                <span className="font-semibold">{app.companyName}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Industry</span>
                <span className="font-semibold">{app.industry}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Application ID</span>
                <span className="font-mono font-semibold">{app.id}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Application Date</span>
                <span className="font-semibold">{app.date}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Loan Amount Requested</span>
                <span className="font-semibold">{fmtCr(app.loanAmount)}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Current Status</span>
                <Badge variant="outline" className={`text-xs ${riskBg}`}>{app.status}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Financial Summary */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">2. Financial Summary</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { label: "Annual Revenue", value: fmtCr(fin.revenue) },
              { label: "Net Profit", value: fmtCr(fin.netProfit) },
              { label: "Total Debt", value: fmtCr(fin.totalDebt) },
              { label: "Total Assets", value: fmtCr(fin.assets) },
              { label: "Total Liabilities", value: fmtCr(fin.liabilities) },
              { label: "Operating Cash Flow", value: fmtCr(fin.cashFlow) },
              { label: "Net Worth", value: fmtCr(netWorth) },
              { label: "Working Capital (Est.)", value: fmtCr(workingCapital) },
              { label: "Loan Amount", value: fmtCr(app.loanAmount) },
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-bold text-base mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Ratio Analysis */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">3. Financial Ratio Analysis</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Ratio</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Value</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Benchmark</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Debt-to-Income Ratio", value: `${scoring.ratios.debtToIncome}%`, bench: "< 50%", ok: scoring.ratios.debtToIncome < 50 },
                { name: "Profit Margin", value: `${scoring.ratios.profitMargin}%`, bench: "> 10%", ok: scoring.ratios.profitMargin > 10 },
                { name: "Current / Liquidity Ratio", value: `${scoring.ratios.liquidityRatio}`, bench: "> 1.5", ok: scoring.ratios.liquidityRatio > 1.5 },
                { name: "Loan-to-Asset Ratio", value: `${scoring.ratios.loanToAsset}%`, bench: "< 50%", ok: scoring.ratios.loanToAsset < 50 },
                { name: "Return on Assets (ROA)", value: `${returnOnAssets}%`, bench: "> 5%", ok: Number(returnOnAssets) > 5 },
                { name: "Debt-to-Equity Ratio", value: `${debtEquity}`, bench: "< 2.0", ok: debtEquity !== "N/A" && Number(debtEquity) < 2 },
                { name: "Interest Coverage Ratio", value: `${interestCoverage}x`, bench: "> 2.0x", ok: interestCoverage !== "N/A" && Number(interestCoverage) > 2 },
              ].map((r) => (
                <tr key={r.name} className="border-b last:border-0">
                  <td className="px-3 py-2.5 font-medium">{r.name}</td>
                  <td className="px-3 py-2.5 text-center font-bold">{r.value}</td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">{r.bench}</td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge variant="outline" className={r.ok ? "bg-risk-low/10 text-risk-low border-risk-low/30" : "bg-risk-high/10 text-risk-high border-risk-high/30"}>
                      {r.ok ? "✓ Healthy" : "✗ Concern"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Section 4: Credit Score & Risk Assessment */}
        <Card className={`p-6 border-2 ${riskBorder}`}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">4. Credit Score & Risk Assessment</h2>
          </div>
          <div className="flex items-center gap-8">
            {/* Score Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={scoring.riskLevel === "Low" ? "hsl(var(--risk-low))" : scoring.riskLevel === "Medium" ? "hsl(var(--risk-medium))" : "hsl(var(--risk-high))"}
                    strokeWidth="10"
                    strokeDasharray={`${(scoring.score / 100) * 314.16} 314.16`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${riskText}`}>{scoring.score}</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
              </div>
              <Badge className={`mt-2 ${riskBg}`}>{scoring.riskLevel} Risk</Badge>
            </div>

            <div className="flex-1 space-y-3">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground font-medium mb-1">AI RECOMMENDATION</p>
                <p className={`text-lg font-bold ${riskText}`}>{scoring.recommendation}</p>
                <p className="text-sm text-muted-foreground mt-1">{scoring.explanation}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/50 rounded p-2">
                  <span className="text-xs text-muted-foreground">Score Range</span>
                  <p className="font-semibold">{scoring.score > 70 ? "71-100 (Safe)" : scoring.score >= 40 ? "40-70 (Moderate)" : "0-39 (Critical)"}</p>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <p className="font-semibold">{app.financials ? "High — Full Data" : "Low — Partial Data"}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 5: Fraud Detection */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">5. Fraud Detection & Red Flags</h2>
          </div>
          {scoring.fraudFlags.length > 0 ? (
            <div className="space-y-2">
              {scoring.fraudFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-risk-high/5 border border-risk-high/20">
                  <AlertTriangle className="h-4 w-4 text-risk-high mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-risk-high">{flag}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Flagged by AI Fraud Detection Engine</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-risk-low/5 border border-risk-low/20">
              <ShieldCheck className="h-5 w-5 text-risk-low" />
              <div>
                <p className="text-sm font-medium text-risk-low">No Fraud Flags Detected</p>
                <p className="text-xs text-muted-foreground">All automated fraud checks passed successfully</p>
              </div>
            </div>
          )}
        </Card>

        {/* Section 6: Scoring Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">6. Score Deduction Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Criteria</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Condition</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Deduction</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Applied</th>
              </tr>
            </thead>
            <tbody>
              {[
                { criteria: "Debt-to-Income > 80%", condition: `${scoring.ratios.debtToIncome}%`, deduction: -30, applied: scoring.ratios.debtToIncome > 80 },
                { criteria: "Debt-to-Income 50-80%", condition: `${scoring.ratios.debtToIncome}%`, deduction: -15, applied: scoring.ratios.debtToIncome >= 50 && scoring.ratios.debtToIncome <= 80 },
                { criteria: "Negative Profit Margin", condition: `${scoring.ratios.profitMargin}%`, deduction: -25, applied: scoring.ratios.profitMargin < 0 },
                { criteria: "Profit Margin 0-10%", condition: `${scoring.ratios.profitMargin}%`, deduction: -10, applied: scoring.ratios.profitMargin >= 0 && scoring.ratios.profitMargin < 10 },
                { criteria: "Liquidity Ratio < 1", condition: `${scoring.ratios.liquidityRatio}`, deduction: -20, applied: scoring.ratios.liquidityRatio < 1 },
                { criteria: "Loan-to-Asset > 70%", condition: `${scoring.ratios.loanToAsset}%`, deduction: -15, applied: scoring.ratios.loanToAsset > 70 },
                { criteria: "Negative Cash Flow", condition: fmtCr(fin.cashFlow), deduction: -10, applied: fin.cashFlow < 0 },
              ].map((row) => (
                <tr key={row.criteria} className={`border-b last:border-0 ${row.applied ? "bg-risk-high/5" : ""}`}>
                  <td className="px-3 py-2.5">{row.criteria}</td>
                  <td className="px-3 py-2.5 text-center font-mono">{row.condition}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-risk-high">{row.deduction}</td>
                  <td className="px-3 py-2.5 text-center">
                    {row.applied ? <Badge className="bg-risk-high/10 text-risk-high border-risk-high/30 text-[10px]">Yes</Badge> : <span className="text-muted-foreground text-xs">No</span>}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/50 font-bold">
                <td className="px-3 py-2.5">Final Score</td>
                <td className="px-3 py-2.5 text-center">Base: 100</td>
                <td className="px-3 py-2.5 text-center text-risk-high">-{100 - scoring.score}</td>
                <td className={`px-3 py-2.5 text-center ${riskText}`}>{scoring.score}/100</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Section 7: Conclusion */}
        <Card className={`p-6 border-2 ${riskBorder}`}>
          <h2 className="text-lg font-bold mb-3">7. Conclusion & Recommendation</h2>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              Based on the comprehensive credit appraisal of <strong>{app.companyName}</strong> operating in the <strong>{app.industry}</strong> sector,
              requesting a loan of <strong>{fmtCr(app.loanAmount)}</strong>, the AI Credit Scoring Engine has assigned a credit score of{" "}
              <strong className={riskText}>{scoring.score}/100</strong> ({scoring.riskLevel} Risk).
            </p>
            <Separator />
            <p className="text-sm">
              <strong>Recommendation:</strong>{" "}
              <span className={`font-bold ${riskText}`}>{scoring.recommendation}</span> — {scoring.explanation}.
            </p>
            {scoring.fraudFlags.length > 0 && (
              <p className="text-sm text-risk-high">
                <strong>Note:</strong> {scoring.fraudFlags.length} fraud flag(s) detected. Manual review by the credit committee is advised before final decision.
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <p>Generated by Credit Risk AI Analyzer</p>
            <p>Authorized Signatory: {user?.name || "—"}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CAMReportPage;
