import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, CheckCircle } from "lucide-react";

const initialUsers = [
  { name: "Raj Kumar", email: "raj@bank.com", role: "Admin" },
  { name: "Priya Sharma", email: "priya@bank.com", role: "Credit Manager" },
  { name: "Amit Patel", email: "amit@bank.com", role: "Analyst" },
];

const AdminPage: React.FC = () => {
  const [users] = useState(initialUsers);
  const [autoApprove, setAutoApprove] = useState(75);
  const [autoReject, setAutoReject] = useState(30);
  const [fraudDetection, setFraudDetection] = useState(true);
  const [autoProcessing, setAutoProcessing] = useState(true);

  const systems = [
    { name: "AI Engine", status: "Operational" },
    { name: "Database", status: "Operational" },
    { name: "Document Parser", status: "Operational" },
    { name: "Fraud Detector", status: "Operational" },
  ];

  const roleBadge: Record<string, string> = {
    Admin: "bg-primary text-primary-foreground",
    "Credit Manager": "bg-risk-medium text-risk-medium-foreground",
    Analyst: "bg-risk-low text-risk-low-foreground",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">User Management</h3>
            <Button size="sm"><UserPlus className="h-3 w-3 mr-1" /> Add User</Button>
          </div>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.email} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge className={roleBadge[u.role]}>{u.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Settings */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">AI Engine Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Auto-Approve Threshold</Label>
              <Input type="number" value={autoApprove} onChange={(e) => setAutoApprove(+e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Auto-Reject Threshold</Label>
              <Input type="number" value={autoReject} onChange={(e) => setAutoReject(+e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Fraud Detection</Label>
              <Switch checked={fraudDetection} onCheckedChange={setFraudDetection} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Auto-Processing</Label>
              <Switch checked={autoProcessing} onCheckedChange={setAutoProcessing} />
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systems.map((s) => (
              <div key={s.name} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-4 w-4 text-risk-low" />
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-risk-low">{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
