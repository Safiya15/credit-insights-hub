import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { Application } from "@/contexts/AppDataContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIUnderwriterChatProps {
  application: Application;
  scoring: {
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
  };
}

const SUGGESTED_QUESTIONS = [
  "Should I approve this loan?",
  "What is the biggest risk?",
  "Summarize the financial health",
  "What conditions should I set for approval?",
];

const AIUnderwriterChat: React.FC<AIUnderwriterChatProps> = ({ application, scoring }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fin = application.financials || { revenue: 0, netProfit: 0, totalDebt: 0, assets: 0, liabilities: 0, cashFlow: 0 };

  const systemPrompt = `You are an expert AI Credit Underwriter assisting a bank manager in evaluating a commercial loan application. Be concise, data-driven, and professional.

APPLICATION CONTEXT:
- Company: ${application.companyName}
- Industry: ${application.industry}
- Loan Amount Requested: ₹${(application.loanAmount / 10000000).toFixed(2)} Cr
- Application Date: ${application.date}
- Current Status: ${application.status}

FINANCIALS:
- Revenue: ₹${(fin.revenue / 10000000).toFixed(2)} Cr
- Net Profit: ₹${(fin.netProfit / 10000000).toFixed(2)} Cr
- Total Debt: ₹${(fin.totalDebt / 10000000).toFixed(2)} Cr
- Total Assets: ₹${(fin.assets / 10000000).toFixed(2)} Cr
- Total Liabilities: ₹${(fin.liabilities / 10000000).toFixed(2)} Cr
- Cash Flow: ₹${(fin.cashFlow / 10000000).toFixed(2)} Cr

AI CREDIT SCORING RESULTS:
- Credit Score: ${scoring.score}/100
- Risk Level: ${scoring.riskLevel}
- Recommendation: ${scoring.recommendation}
- Explanation: ${scoring.explanation}

KEY RATIOS:
- Debt-to-Income: ${scoring.ratios.debtToIncome}%
- Profit Margin: ${scoring.ratios.profitMargin}%
- Liquidity Ratio: ${scoring.ratios.liquidityRatio}
- Loan-to-Asset: ${scoring.ratios.loanToAsset}%

FRAUD FLAGS: ${scoring.fraudFlags.length > 0 ? scoring.fraudFlags.join("; ") : "None detected"}

Answer the bank manager's questions using this data. Provide specific numbers. Use markdown formatting.`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-ai`;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          prompt: text.trim(),
          systemPrompt,
          maxTokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      const assistantContent =
        data.content?.[0]?.text || data.choices?.[0]?.message?.content || "I couldn't generate a response.";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (error: unknown) {
      console.error("Chat error:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "AI Chat Error", description: msg, variant: "destructive" });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">AI Underwriter</h3>
          <p className="text-xs text-muted-foreground">
            Analyzing {application.companyName} — Score {scoring.score}/100
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Ask the AI Underwriter</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask questions about this loan application. All financial data and ratios are pre-loaded.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 whitespace-normal text-left"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted/50 border rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this application..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default AIUnderwriterChat;
