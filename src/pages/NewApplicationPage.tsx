import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/contexts/AppDataContext";
import { calculateCreditScore } from "@/lib/creditScoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Upload, ArrowRight, ArrowLeft, FileText, Sparkles } from "lucide-react";
import AutoDraftEmail from "@/components/AutoDraftEmail";

const INDUSTRIES = ["Technology", "Manufacturing", "Healthcare", "Real Estate", "Retail", "Agriculture", "Education", "Logistics", "Finance", "Energy"];

const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addApplication, applications } = useAppData();
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateCreditScore> | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loanAmount, setLoanAmount] = useState("");

  const [docs, setDocs] = useState<Record<string, { uploaded: boolean; fileName: string }>>({
    balanceSheet: { uploaded: false, fileName: "" },
    gst: { uploaded: false, fileName: "" },
    bankStatement: { uploaded: false, fileName: "" },
    financialReport: { uploaded: false, fileName: "" },
  });
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const DEMO_COMPANY = {
    companyName: "Zenith Innovations Pvt Ltd",
    industry: "Technology",
    loanAmount: "7500000",
    revenue: "32000000",
    netProfit: "5800000",
    totalDebt: "4200000",
    assets: "28000000",
    liabilities: "11000000",
    cashFlow: "7200000",
  };

  const loadDemoCompany = () => {
    setCompanyName(DEMO_COMPANY.companyName);
    setIndustry(DEMO_COMPANY.industry);
    setLoanAmount(DEMO_COMPANY.loanAmount);
    setRevenue(DEMO_COMPANY.revenue);
    setNetProfit(DEMO_COMPANY.netProfit);
    setTotalDebt(DEMO_COMPANY.totalDebt);
    setAssets(DEMO_COMPANY.assets);
    setLiabilities(DEMO_COMPANY.liabilities);
    setCashFlow(DEMO_COMPANY.cashFlow);
  };

  const loadDemoDocs = () => {
    setDocs({
      balanceSheet: { uploaded: true, fileName: "Zenith_BalanceSheet_2025.pdf" },
      gst: { uploaded: true, fileName: "Zenith_GST_Returns_Q4.pdf" },
      bankStatement: { uploaded: true, fileName: "Zenith_BankStatement_Mar2026.pdf" },
      financialReport: { uploaded: true, fileName: "Zenith_AnnualReport_2025.pdf" },
    });
  };

  const handleFileSelect = (doc: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocs((d) => ({ ...d, [doc]: { uploaded: true, fileName: file.name } }));
    }
  };

  const [revenue, setRevenue] = useState("");
  const [netProfit, setNetProfit] = useState("");
  const [totalDebt, setTotalDebt] = useState("");
  const [assets, setAssets] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [cashFlow, setCashFlow] = useState("");

  const handleSubmit = () => {
    const scoring = calculateCreditScore({
      revenue: +revenue || 1,
      netProfit: +netProfit || 0,
      totalDebt: +totalDebt || 0,
      assets: +assets || 1,
      liabilities: +liabilities || 1,
      cashFlow: +cashFlow || 0,
      loanAmount: +loanAmount || 0,
    });
    setResult(scoring);

    const statusMap: Record<string, "Approved" | "Rejected" | "In Review"> = { Approve: "Approved", Reject: "Rejected", Review: "In Review" };
    const nextId = applications.length + 1;
    const newApp = {
      id: `APP-${String(nextId).padStart(3, "0")}`,
      companyName: companyName || "Unnamed Company",
      industry: industry || "Other",
      loanAmount: +loanAmount || 0,
      score: scoring.score,
      riskLevel: scoring.riskLevel,
      recommendation: scoring.recommendation,
      status: statusMap[scoring.recommendation],
      date: new Date().toISOString().split("T")[0],
      financials: { revenue: +revenue, netProfit: +netProfit, totalDebt: +totalDebt, assets: +assets, liabilities: +liabilities, cashFlow: +cashFlow },
      fraudFlags: scoring.fraudFlags,
      explanation: scoring.explanation,
    };
    addApplication(newApp);
  };

  const riskColor = result ? (result.riskLevel === "Low" ? "text-risk-low" : result.riskLevel === "Medium" ? "text-risk-medium" : "text-risk-high") : "";

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Credit Score Result</h1>
        <Card className="p-8 text-center">
          <div className={`text-6xl font-bold ${riskColor}`}>{result.score}</div>
          <Badge className={`mt-3 ${result.riskLevel === "Low" ? "bg-risk-low text-risk-low-foreground" : result.riskLevel === "Medium" ? "bg-risk-medium text-risk-medium-foreground" : "bg-risk-high text-risk-high-foreground"}`}>
            {result.riskLevel} Risk — {result.recommendation}
          </Badge>
          <p className="mt-4 text-sm text-muted-foreground">{result.explanation}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-3">Financial Ratios</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted rounded-md p-3"><p className="text-muted-foreground text-xs">Debt-to-Income</p><p className="font-bold">{result.ratios.debtToIncome}%</p></div>
            <div className="bg-muted rounded-md p-3"><p className="text-muted-foreground text-xs">Profit Margin</p><p className="font-bold">{result.ratios.profitMargin}%</p></div>
            <div className="bg-muted rounded-md p-3"><p className="text-muted-foreground text-xs">Liquidity Ratio</p><p className="font-bold">{result.ratios.liquidityRatio}</p></div>
            <div className="bg-muted rounded-md p-3"><p className="text-muted-foreground text-xs">Loan-to-Asset</p><p className="font-bold">{result.ratios.loanToAsset}%</p></div>
          </div>
        </Card>
        {result.fraudFlags.length > 0 && (
          <Card className="p-6 border-risk-high/30">
            <h3 className="text-sm font-semibold text-risk-high mb-2">⚠ Fraud Flags</h3>
            <ul className="space-y-1 text-sm">
              {result.fraudFlags.map((f, i) => <li key={i} className="text-risk-high">• {f}</li>)}
            </ul>
          </Card>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setResult(null); setStep(1); }}>New Application</Button>
          <Button onClick={() => navigate("/applications")}>View Applications</Button>
          <AutoDraftEmail
            companyName={companyName || "Unnamed Company"}
            loanAmount={+loanAmount || 0}
            industry={industry || "Other"}
            recommendation={result.recommendation}
            score={result.score}
            riskLevel={result.riskLevel}
            explanation={result.explanation}
            ratios={result.ratios}
            fraudFlags={result.fraudFlags}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Application</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {step > s ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Company Information</h2>
              <Button size="sm" variant="outline" onClick={loadDemoCompany} className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Load Demo Company
              </Button>
            </div>
            <div>
              <Label>Company Name</Label>
              <Input className="mt-1" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter company name" />
            </div>
            <div>
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Loan Amount (₹)</Label>
              <Input className="mt-1" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="e.g. 5000000" />
            </div>
            <Button onClick={() => setStep(2)} className="w-full">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Documents</h2>
              <Button size="sm" variant="outline" onClick={loadDemoDocs} className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Load Demo Docs
              </Button>
            </div>
            {(["balanceSheet", "gst", "bankStatement", "financialReport"] as const).map((doc) => {
              const labels: Record<string, string> = { balanceSheet: "Balance Sheet", gst: "GST Data", bankStatement: "Bank Statement", financialReport: "Financial Report" };
              return (
                <div key={doc} className={`flex items-center justify-between p-3 rounded-lg border ${docs[doc].uploaded ? "border-risk-low/50 bg-risk-low/5" : "border-border"}`}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">{labels[doc]}</span>
                      {docs[doc].uploaded && <p className="text-xs text-muted-foreground">{docs[doc].fileName}</p>}
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[doc] = el; }}
                    accept=".pdf,.xlsx,.csv,.doc,.docx"
                    onChange={(e) => handleFileSelect(doc, e)}
                  />
                  <Button
                    size="sm"
                    variant={docs[doc].uploaded ? "outline" : "default"}
                    onClick={() => {
                      if (docs[doc].uploaded) {
                        setDocs((d) => ({ ...d, [doc]: { uploaded: false, fileName: "" } }));
                      } else {
                        fileInputRefs.current[doc]?.click();
                      }
                    }}
                  >
                    {docs[doc].uploaded ? <><CheckCircle className="h-3 w-3 mr-1" /> Remove</> : <><Upload className="h-3 w-3 mr-1" /> Browse</>}
                  </Button>
                </div>
              );
            })}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Financial Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Revenue (₹)</Label><Input className="mt-1" type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="25000000" /></div>
              <div><Label>Net Profit (₹)</Label><Input className="mt-1" type="number" value={netProfit} onChange={(e) => setNetProfit(e.target.value)} placeholder="4500000" /></div>
              <div><Label>Total Debt (₹)</Label><Input className="mt-1" type="number" value={totalDebt} onChange={(e) => setTotalDebt(e.target.value)} placeholder="3000000" /></div>
              <div><Label>Assets (₹)</Label><Input className="mt-1" type="number" value={assets} onChange={(e) => setAssets(e.target.value)} placeholder="20000000" /></div>
              <div><Label>Liabilities (₹)</Label><Input className="mt-1" type="number" value={liabilities} onChange={(e) => setLiabilities(e.target.value)} placeholder="8000000" /></div>
              <div><Label>Cash Flow (₹)</Label><Input className="mt-1" type="number" value={cashFlow} onChange={(e) => setCashFlow(e.target.value)} placeholder="5000000" /></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              <Button onClick={handleSubmit} className="flex-1">Calculate Credit Score</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NewApplicationPage;
