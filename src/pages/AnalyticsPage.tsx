import React from "react";
import { useAppData } from "@/contexts/AppDataContext";
import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const AnalyticsPage: React.FC = () => {
  const { applications } = useAppData();

  // Monthly applications
  const monthlyData = [
    { month: "Oct", count: 12 }, { month: "Nov", count: 18 }, { month: "Dec", count: 15 },
    { month: "Jan", count: 22 }, { month: "Feb", count: 19 }, { month: "Mar", count: applications.length },
  ];

  // Risk distribution
  const riskDist = [
    { name: "Low", value: applications.filter((a) => a.riskLevel === "Low").length },
    { name: "Medium", value: applications.filter((a) => a.riskLevel === "Medium").length },
    { name: "High", value: applications.filter((a) => a.riskLevel === "High").length },
  ];
  const RISK_COLORS = ["hsl(var(--risk-low))", "hsl(var(--risk-medium))", "hsl(var(--risk-high))"];

  // Score distribution
  const scoreDist = [
    { range: "0-20", count: applications.filter((a) => a.score <= 20).length },
    { range: "21-40", count: applications.filter((a) => a.score > 20 && a.score <= 40).length },
    { range: "41-60", count: applications.filter((a) => a.score > 40 && a.score <= 60).length },
    { range: "61-80", count: applications.filter((a) => a.score > 60 && a.score <= 80).length },
    { range: "81-100", count: applications.filter((a) => a.score > 80).length },
  ];

  // Avg score by industry
  const industries = [...new Set(applications.map((a) => a.industry))];
  const industryAvg = industries.map((ind) => {
    const apps = applications.filter((a) => a.industry === ind);
    return { industry: ind, avg: Math.round(apps.reduce((s, a) => s + a.score, 0) / apps.length) };
  }).sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Monthly Applications</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Risk Distribution</h3>
          <div className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {riskDist.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Credit Score Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Avg Score by Industry</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryAvg} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <YAxis dataKey="industry" type="category" tick={{ fontSize: 11 }} width={90} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avg" fill="hsl(var(--risk-low))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
