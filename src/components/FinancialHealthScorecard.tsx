import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RatioData {
  debtToIncome: number;
  profitMargin: number;
  liquidityRatio: number;
  loanToAsset: number;
}

interface FinancialHealthScorecardProps {
  ratios: RatioData;
  industry: string;
}

interface RatioConfig {
  label: string;
  value: number;
  benchmark: number;
  unit: string;
  /** true = lower is better (debt ratios), false = higher is better */
  lowerIsBetter: boolean;
  maxDisplay: number;
}

const INDUSTRY_BENCHMARKS: Record<string, Partial<Record<string, number>>> = {
  Technology: { debtToIncome: 35, profitMargin: 18, liquidityRatio: 2.0, loanToAsset: 30 },
  Manufacturing: { debtToIncome: 50, profitMargin: 10, liquidityRatio: 1.5, loanToAsset: 40 },
  Healthcare: { debtToIncome: 40, profitMargin: 15, liquidityRatio: 1.8, loanToAsset: 35 },
  "Real Estate": { debtToIncome: 55, profitMargin: 12, liquidityRatio: 1.3, loanToAsset: 50 },
  Retail: { debtToIncome: 45, profitMargin: 8, liquidityRatio: 1.4, loanToAsset: 40 },
  Agriculture: { debtToIncome: 50, profitMargin: 7, liquidityRatio: 1.2, loanToAsset: 45 },
  Education: { debtToIncome: 40, profitMargin: 10, liquidityRatio: 1.5, loanToAsset: 35 },
  Logistics: { debtToIncome: 50, profitMargin: 8, liquidityRatio: 1.3, loanToAsset: 45 },
  Finance: { debtToIncome: 45, profitMargin: 20, liquidityRatio: 1.8, loanToAsset: 35 },
  Energy: { debtToIncome: 55, profitMargin: 12, liquidityRatio: 1.4, loanToAsset: 50 },
};

const DEFAULT_BENCHMARKS = { debtToIncome: 50, profitMargin: 10, liquidityRatio: 1.5, loanToAsset: 40 };

function getGrade(value: number, benchmark: number, lowerIsBetter: boolean): { grade: string; color: string; bgColor: string } {
  const ratio = lowerIsBetter ? benchmark / Math.max(value, 0.01) : value / Math.max(benchmark, 0.01);

  if (ratio >= 1.5) return { grade: "A", color: "text-risk-low", bgColor: "bg-risk-low" };
  if (ratio >= 1.15) return { grade: "B", color: "text-risk-low", bgColor: "bg-risk-low/70" };
  if (ratio >= 0.85) return { grade: "C", color: "text-risk-medium", bgColor: "bg-risk-medium" };
  if (ratio >= 0.6) return { grade: "D", color: "text-risk-high/80", bgColor: "bg-risk-high/70" };
  return { grade: "F", color: "text-risk-high", bgColor: "bg-risk-high" };
}

function getBarColor(grade: string) {
  switch (grade) {
    case "A": return "bg-risk-low";
    case "B": return "bg-risk-low/70";
    case "C": return "bg-risk-medium";
    case "D": return "bg-risk-high/70";
    case "F": return "bg-risk-high";
    default: return "bg-muted";
  }
}

const FinancialHealthScorecard: React.FC<FinancialHealthScorecardProps> = ({ ratios, industry }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const benchmarks = { ...DEFAULT_BENCHMARKS, ...(INDUSTRY_BENCHMARKS[industry] || {}) };

  const configs: RatioConfig[] = [
    { label: "Debt-to-Income", value: ratios.debtToIncome, benchmark: benchmarks.debtToIncome, unit: "%", lowerIsBetter: true, maxDisplay: 120 },
    { label: "Profit Margin", value: ratios.profitMargin, benchmark: benchmarks.profitMargin, unit: "%", lowerIsBetter: false, maxDisplay: 50 },
    { label: "Liquidity Ratio", value: ratios.liquidityRatio, benchmark: benchmarks.liquidityRatio, unit: "x", lowerIsBetter: false, maxDisplay: 4 },
    { label: "Loan-to-Asset", value: ratios.loanToAsset, benchmark: benchmarks.loanToAsset, unit: "%", lowerIsBetter: true, maxDisplay: 100 },
  ];

  // Derived ratios (ROA and Interest Coverage approximations)
  // These use the same pattern but with estimated values
  const overallGrades = configs.map((c) => getGrade(c.value, c.benchmark, c.lowerIsBetter));
  const gradePoints: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const avgGPA = overallGrades.reduce((sum, g) => sum + gradePoints[g.grade], 0) / overallGrades.length;
  const overallGrade = avgGPA >= 3.5 ? "A" : avgGPA >= 2.5 ? "B" : avgGPA >= 1.5 ? "C" : avgGPA >= 0.5 ? "D" : "F";
  const overallInfo = getGrade(avgGPA, 3, false);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Financial Health Scorecard</h2>
          <Badge variant="outline" className="text-xs text-muted-foreground">{industry}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Overall Grade</span>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg font-black text-white ${getBarColor(overallGrade)}`}>
            {overallGrade}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {configs.map((cfg) => {
          const { grade, color } = getGrade(cfg.value, cfg.benchmark, cfg.lowerIsBetter);
          const barPercent = Math.min((Math.abs(cfg.value) / cfg.maxDisplay) * 100, 100);
          const benchmarkPercent = Math.min((cfg.benchmark / cfg.maxDisplay) * 100, 100);

          return (
            <div key={cfg.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{cfg.label}</span>
                  <span className={`text-sm font-bold ${color}`}>
                    {cfg.value}{cfg.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Benchmark: {cfg.benchmark}{cfg.unit}
                  </span>
                  <div className={`h-7 w-7 rounded flex items-center justify-center text-xs font-black text-white ${getBarColor(grade)}`}>
                    {grade}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${getBarColor(grade)}`}
                  style={{ width: animated ? `${barPercent}%` : "0%" }}
                />
                {/* Benchmark marker */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-foreground/50"
                  style={{ left: `${benchmarkPercent}%` }}
                  title={`Industry Benchmark: ${cfg.benchmark}${cfg.unit}`}
                />
              </div>

              {/* Comparison text */}
              <p className="text-[11px] text-muted-foreground">
                {cfg.lowerIsBetter
                  ? cfg.value <= cfg.benchmark
                    ? `✓ ${((1 - cfg.value / cfg.benchmark) * 100).toFixed(0)}% better than ${industry} benchmark`
                    : `✗ ${((cfg.value / cfg.benchmark - 1) * 100).toFixed(0)}% above ${industry} benchmark`
                  : cfg.value >= cfg.benchmark
                    ? `✓ ${((cfg.value / cfg.benchmark - 1) * 100).toFixed(0)}% above ${industry} benchmark`
                    : `✗ ${((1 - cfg.value / cfg.benchmark) * 100).toFixed(0)}% below ${industry} benchmark`
                }
              </p>
            </div>
          );
        })}
      </div>

      {/* Grade legend */}
      <div className="mt-5 pt-4 border-t flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="font-medium">Grading:</span>
        {["A", "B", "C", "D", "F"].map((g) => (
          <div key={g} className="flex items-center gap-1">
            <div className={`h-4 w-4 rounded text-[10px] font-bold text-white flex items-center justify-center ${getBarColor(g)}`}>{g}</div>
            <span>{g === "A" ? "Excellent" : g === "B" ? "Good" : g === "C" ? "Fair" : g === "D" ? "Poor" : "Critical"}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FinancialHealthScorecard;
