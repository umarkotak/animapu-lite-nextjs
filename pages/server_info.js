"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import animapuApi from "@/apis/AnimapuApi";

const StatCard = ({ title, children }) => (
  <Card>
    <CardContent className="p-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </CardContent>
  </Card>
);

const timeAgo = (iso) => {
  if (!iso) return "-";
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units = [
    ["year", 365*24*3600],
    ["month", 30*24*3600],
    ["day", 24*3600],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [name, secs] of units) {
    const v = Math.floor(diff / secs);
    if (v >= 1) return `${v} ${name}${v>1?"s":""} ago`;
  }
  return "just now";
};

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${animapuApi.GoHomeServerHost}/go-home-server/system/status`);
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        setStatus(json?.data ?? null);
      } catch {
        setError("Failed to fetch system status.");
      }
    })();
  }, []);

  if (!status && !error) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  const s = status;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <StatCard title="CPU Usage">
        <p>{s.cpu_usage_percent?.toFixed?.(2)}%</p>
        <Progress value={s.cpu_usage_percent} />
      </StatCard>

      <StatCard title="Memory Usage">
        <p>
          {s.memory_used_mb}MB / {s.memory_total_mb}MB ({s.memory_used_percent?.toFixed?.(2)}%)
        </p>
        <Progress value={s.memory_used_percent} />
      </StatCard>

      <StatCard title="Disk Usage">
        <p>
          {s.disk_used_gb}GB / {s.disk_total_gb}GB ({s.disk_used_percent?.toFixed?.(2)}%)
        </p>
        <Progress value={s.disk_used_percent} />
      </StatCard>

      <StatCard title="System Info">
        <p><strong>Network:</strong> {s.network_name}</p>
        <p><strong>Platform:</strong> {s.platform}</p>
        <p><strong>Version:</strong> {s.platform_version}</p>
        <p><strong>Uptime:</strong> {s.uptime}</p>
      </StatCard>

      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Load Averages</h2>
          <p><strong>1m:</strong> {s.load_average1m}</p>
          <p><strong>5m:</strong> {s.load_average5m}</p>
          <p><strong>15m:</strong> {s.load_average15m}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Minecraft Server</h2>
          <div className="flex flex-wrap items-center gap-4">
            <p><strong>Host:</strong> {s.minecraft_server_status?.server_host}</p>
            <p className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  s.minecraft_server_status?.online ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {s.minecraft_server_status?.online ? "Online" : "Offline"}
            </p>
            <p>
              <strong>Last ping:</strong>{" "}
              {timeAgo(s.minecraft_server_status?.last_ping_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
