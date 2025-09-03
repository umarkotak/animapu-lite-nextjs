"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Send, Sun, Moon, Users, MapPin, Gamepad2, Crown, Shield, Zap } from "lucide-react";
import animapuApi from "@/apis/AnimapuApi";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${animapuApi.GoHomeServerHost}/go-home-server/system/status`);
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      setStatus(json?.data ?? null);
    } catch {
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus()
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="">
      {/* Header with Refresh Button and Indicator */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">System Status</h1>
        <div className="flex items-center gap-2">
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard title="CPU Usage">
          <p className="text-2xl font-bold">{status?.cpu_usage_percent?.toFixed(1) ?? "N/A"}%</p>
          <Progress value={status?.cpu_usage_percent ?? 0} className="mt-2" />
        </StatCard>

        <StatCard title="Memory Usage">
          <p className="text-2xl font-bold">{status?.memory_used_percent?.toFixed(1) ?? "N/A"}%</p>
          <p className="text-sm text-muted-foreground">
            {status?.memory_used_mb ?? "?"}MB / {status?.memory_total_mb ?? "?"}MB
          </p>
          <Progress value={status?.memory_used_percent ?? 0} className="mt-2" />
        </StatCard>

        <StatCard title="Disk Usage">
          <p className="text-2xl font-bold">{status?.disk_used_percent?.toFixed(1) ?? "N/A"}%</p>
          <p className="text-sm text-muted-foreground">
            {status?.disk_used_gb ?? "?"}GB / {status?.disk_total_gb ?? "?"}GB
          </p>
          <Progress value={status?.disk_used_percent ?? 0} className="mt-2" />
        </StatCard>

        <StatCard title="System & Load">
          <p className="text-sm"><strong>Uptime:</strong> {status?.uptime ?? "-"}</p>
          <p className="text-sm"><strong>Platform:</strong> {status?.platform ?? "-"} {status?.platform_version ?? ""}</p>
          <p className="text-sm"><strong>Network:</strong> {status?.network_name ?? "-"}</p>
        </StatCard>
      </div>
    </div>
  );
}

const StatCard = ({ title, children, className = "" }) => (
  <Card className={className}>
    <CardContent className="p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </CardContent>
  </Card>
);