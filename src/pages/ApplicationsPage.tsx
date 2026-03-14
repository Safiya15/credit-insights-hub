import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/contexts/AppDataContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";

const riskColor: Record<string, string> = {
  Low: "bg-risk-low text-risk-low-foreground",
  Medium: "bg-risk-medium text-risk-medium-foreground",
  High: "bg-risk-high text-risk-high-foreground",
};

const statusColor: Record<string, string> = {
  Approved: "bg-risk-low/10 text-risk-low border border-risk-low/30",
  Rejected: "bg-risk-high/10 text-risk-high border border-risk-high/30",
  Pending: "bg-risk-medium/10 text-risk-medium border border-risk-medium/30",
  "In Review": "bg-primary/10 text-primary border border-primary/30",
};

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { applications } = useAppData();
  const [search, setSearch] = useState("");

  const filtered = applications.filter((a) =>
    a.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Industry</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Loan Amount</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Risk Level</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Recommendation</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">CAM Report</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{app.id}</td>
                  <td className="px-4 py-3 font-medium">{app.companyName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.industry}</td>
                  <td className="px-4 py-3 text-right">₹{(app.loanAmount / 100000).toFixed(1)}L</td>
                  <td className="px-4 py-3 text-center font-bold">{app.score}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`${riskColor[app.riskLevel]} text-[10px] px-2`}>{app.riskLevel}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">{app.recommendation}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[app.status]}`}>{app.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{app.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No applications found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationsPage;
