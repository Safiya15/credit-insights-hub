import React from "react";
import { useAppData } from "@/contexts/AppDataContext";
import { Card } from "@/components/ui/card";
import { FileText, CheckCircle, BarChart3, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { month: "Sep", revenue: 32, profit: 8 },
  { month: "Oct", revenue: 35, profit: 10 },
  { month: "Nov", revenue: 38, profit: 9 },
  { month: "Dec", revenue: 42, profit: 14 },
  { month: "Jan", revenue: 40, profit: 12 },
  { month: "Feb", revenue: 45, profit: 15 },
  { month: "Mar", revenue: 50, profit: 18 },
];

const CreditGauge: React.FC<{ score: number }> = ({ score }) => {
  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? "hsl(var(--risk-low))" : score >= 40 ? "hsl(var(--risk-medium))" : "hsl(var(--risk-high))";

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="100" viewBox="0 0 160 100">
        <path d="M 10 90 A 70 70 0 0 1 150 90" fill="none" stroke="hsl(var(--gauge-track))" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 10 90 A 70 70 0 0 1 150 90"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="80" y="80" textAnchor="middle" className="fill-foreground text-3xl font-bold">{score}</text>
        <text x="80" y="95" textAnchor="middle" className="fill-muted-foreground text-[10px]">Credit Score</text>
      </svg>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { applications } = useAppData();
  const total = applications.length;
  const approved = applications.filter((a) => a.status === "Approved").length;
  const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(0) : "0";
  const avgScore = total > 0 ? Math.round(applications.reduce((s, a) => s + a.score, 0) / total) : 0;
  const fraudCount = applications.filter((a) => a.fraudFlags && a.fraudFlags.length > 0).length;
  const featured = applications[0];

  const stats = [
    { label: "Total Applications", value: total, icon: FileText, color: "text-primary" },
    { label: "Approval Rate", value: `${approvalRate}%`, icon: CheckCircle, color: "text-risk-low" },
    { label: "Avg Credit Score", value: avgScore, icon: BarChart3, color: "text-primary" },
    { label: "Fraud Flags", value: fraudCount, icon: AlertTriangle, color: "text-risk-high" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <s.icon className={`h-8 w-8 ${s.color} opacity-80`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Company */}
        {featured && (
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-sm font-semibold mb-4">Featured Company</h2>
            <p className="text-lg font-bold mb-1">{featured.companyName}</p>
            <p className="text-xs text-muted-foreground mb-4">{featured.industry}</p>
            <CreditGauge score={featured.score} />
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="bg-muted rounded-md p-2">
                <p className="text-muted-foreground">Debt-to-Income</p>
                <p className="font-semibold">{featured.financials ? ((featured.financials.totalDebt / featured.financials.revenue) * 100).toFixed(1) : 0}%</p>
              </div>
              <div className="bg-muted rounded-md p-2">
                <p className="text-muted-foreground">Liquidity Ratio</p>
                <p className="font-semibold">{featured.financials ? (featured.financials.assets / featured.financials.liabilities).toFixed(2) : 0}</p>
              </div>
              <div className="bg-muted rounded-md p-2">
                <p className="text-muted-foreground">Revenue Growth</p>
                <p className="font-semibold text-risk-low">+12.5%</p>
              </div>
              <div className="bg-muted rounded-md p-2">
                <p className="text-muted-foreground">Profit Margin</p>
                <p className="font-semibold">{featured.financials ? ((featured.financials.netProfit / featured.financials.revenue) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </Card>
        )}

        {/* Trend Chart */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4">Revenue & Profit Trend</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Revenue (Cr)" />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--risk-low))" strokeWidth={2} dot={{ r: 3 }} name="Profit (Cr)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
