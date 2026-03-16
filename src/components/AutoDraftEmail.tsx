import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface AutoDraftEmailProps {
  companyName: string;
  loanAmount: number;
  industry: string;
  recommendation: "Approve" | "Review" | "Reject";
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  explanation: string;
  ratios: {
    debtToIncome: number;
    profitMargin: number;
    liquidityRatio: number;
    loanToAsset: number;
  };
  fraudFlags: string[];
}

const AutoDraftEmail: React.FC<AutoDraftEmailProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateEmail = async () => {
    setOpen(true);
    setLoading(true);
    setEmail("");

    const loanCr = (props.loanAmount / 10000000).toFixed(2);
    const isApproval = props.recommendation === "Approve";

    const prompt = `Write a formal bank ${isApproval ? "loan approval" : props.recommendation === "Review" ? "loan review/conditional approval" : "loan rejection"} letter for the following application:

Company: ${props.companyName}
Industry: ${props.industry}
Loan Amount: ₹${loanCr} Cr
Credit Score: ${props.score}/100
Risk Level: ${props.riskLevel}
Recommendation: ${props.recommendation}

Financial Ratios:
- Debt-to-Income: ${props.ratios.debtToIncome}%
- Profit Margin: ${props.ratios.profitMargin}%
- Liquidity Ratio: ${props.ratios.liquidityRatio}
- Loan-to-Asset: ${props.ratios.loanToAsset}%

Fraud Flags: ${props.fraudFlags.length > 0 ? props.fraudFlags.join("; ") : "None"}
AI Explanation: ${props.explanation}

Write as a formal bank letter with:
- Bank name: "National Credit Bank"
- Professional greeting
- Clear decision statement
- Specific financial ratio analysis justifying the decision
- ${isApproval ? "Terms and conditions" : props.recommendation === "Review" ? "Conditions for approval" : "Reasons for rejection and suggestions for re-application"}
- Professional closing with signatory

Use markdown formatting. Keep it concise but thorough (300-400 words).`;

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-ai`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt, systemPrompt: "You are a senior banking officer drafting formal loan decision letters. Be professional, data-driven, and clear.", maxTokens: 1024 }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate email");
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content || "Failed to generate email.";
      setEmail(content);
    } catch (error: unknown) {
      console.error("Email generation error:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Generation Failed", description: msg, variant: "destructive" });
      setEmail("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast({ title: "Copied!", description: "Email content copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant="outline" onClick={generateEmail}>
        <Mail className="mr-2 h-4 w-4" /> Auto Draft Email
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {props.recommendation === "Approve" ? "Approval" : props.recommendation === "Review" ? "Review" : "Rejection"} Letter — {props.companyName}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Drafting email with AI...</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[55vh] pr-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{email}</ReactMarkdown>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            {!loading && email && (
              <Button onClick={handleCopy}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AutoDraftEmail;
