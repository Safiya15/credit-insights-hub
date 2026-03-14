export interface Financials {
  revenue: number;
  netProfit: number;
  totalDebt: number;
  assets: number;
  liabilities: number;
  cashFlow: number;
  loanAmount: number;
}

export interface ScoringResult {
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendation: "Approve" | "Review" | "Reject";
  explanation: string;
  fraudFlags: string[];
  ratios: {
    debtToIncome: number;
    profitMargin: number;
    liquidityRatio: number;
    loanToAsset: number;
  };
}

export function calculateCreditScore(f: Financials): ScoringResult {
  const debtToIncome = f.revenue > 0 ? (f.totalDebt / f.revenue) * 100 : 100;
  const profitMargin = f.revenue > 0 ? (f.netProfit / f.revenue) * 100 : -100;
  const liquidityRatio = f.liabilities > 0 ? f.assets / f.liabilities : f.assets > 0 ? 10 : 0;
  const loanToAsset = f.assets > 0 ? (f.loanAmount / f.assets) * 100 : 100;

  let score = 100;
  if (debtToIncome > 80) score -= 30;
  else if (debtToIncome >= 50) score -= 15;
  if (profitMargin < 0) score -= 25;
  else if (profitMargin < 10) score -= 10;
  if (liquidityRatio < 1) score -= 20;
  if (loanToAsset > 70) score -= 15;
  if (f.cashFlow < 0) score -= 10;
  score = Math.max(0, Math.min(100, score));

  let riskLevel: ScoringResult["riskLevel"];
  let recommendation: ScoringResult["recommendation"];
  let explanation: string;

  if (score > 70) {
    riskLevel = "Low";
    recommendation = "Approve";
    explanation = "Strong financials with healthy profit margin and low debt ratio";
  } else if (score >= 40) {
    riskLevel = "Medium";
    recommendation = "Review";
    explanation = "Application needs review — moderate risk indicators detected";
  } else {
    riskLevel = "High";
    recommendation = "Reject";
    explanation = "Loan rejected due to high debt ratio and negative profit margin";
  }

  const fraudFlags: string[] = [];
  if (f.revenue > 0 && profitMargin > 200) fraudFlags.push("Sudden revenue spike detected");
  if (f.netProfit < 0 && f.loanAmount > f.assets * 0.8) fraudFlags.push("Negative cash flow with high loan request");
  if (f.liabilities > f.assets) fraudFlags.push("Liabilities exceed assets");

  return {
    score,
    riskLevel,
    recommendation,
    explanation,
    fraudFlags,
    ratios: { debtToIncome: +debtToIncome.toFixed(1), profitMargin: +profitMargin.toFixed(1), liquidityRatio: +liquidityRatio.toFixed(2), loanToAsset: +loanToAsset.toFixed(1) },
  };
}
