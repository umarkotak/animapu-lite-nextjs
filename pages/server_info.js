"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import animapuApi from "@/apis/AnimapuApi";

const StatCard = ({ title, children, className = "" }) => (
  <Card className={className}>
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
    ["year", 365 * 24 * 3600],
    ["month", 30 * 24 * 3600],
    ["day", 24 * 3600],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [name, secs] of units) {
    const v = Math.floor(diff / secs);
    if (v >= 1) return `${v} ${name}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${animapuApi.GoHomeServerHost}/go-home-server/system/status`);
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        setStatus(json?.data ?? null);
      } catch {
        setError("Failed to fetch system status.");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!status && !error) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  const s = status;
  const mc = s.minecraft_server_status;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatCard title="CPU Usage">
        <p className="text-2xl font-bold">{s.cpu_usage_percent?.toFixed(1)}%</p>
        <Progress value={s.cpu_usage_percent} className="mt-2" />
      </StatCard>

      <StatCard title="Memory Usage">
        <p className="text-2xl font-bold">{s.memory_used_percent?.toFixed(1)}%</p>
        <p className="text-sm text-muted-foreground">
          {s.memory_used_mb}MB / {s.memory_total_mb}MB
        </p>
        <Progress value={s.memory_used_percent} className="mt-2" />
      </StatCard>

      <StatCard title="Disk Usage">
        <p className="text-2xl font-bold">{s.disk_used_percent?.toFixed(1)}%</p>
        <p className="text-sm text-muted-foreground">
          {s.disk_used_gb}GB / {s.disk_total_gb}GB
        </p>
        <Progress value={s.disk_used_percent} className="mt-2" />
      </StatCard>

      <StatCard title="System & Load">
        <p><strong>Uptime:</strong> {s.uptime}</p>
        <p><strong>Platform:</strong> {s.platform} {s.platform_version}</p>
        <div className="text-sm mt-2">
          <p><strong>Load (1m):</strong> {s.load_average1m?.toFixed(2)}</p>
          <p><strong>Load (5m):</strong> {s.load_average5m?.toFixed(2)}</p>
          <p><strong>Load (15m):</strong> {s.load_average15m?.toFixed(2)}</p>
        </div>
      </StatCard>

      <Card className="lg:col-span-4 md:col-span-2">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold">
              Minecraft Server: <span className="text-primary">{mc?.motd || "N/A"}</span>
            </h2>
            <div className="flex items-center gap-2 text-sm font-mono p-1 bg-secondary rounded">
              {mc?.server_host}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status & Version */}
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Status</h3>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    mc?.online ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="font-bold">{mc?.online ? "Online" : "Offline"}</span>
              </div>
              <p className="text-sm">
                <strong>Version:</strong> {mc?.version || "-"}
              </p>
              <p className="text-sm">
                <strong>Last Ping:</strong> {timeAgo(mc?.last_ping_at)}
              </p>
            </div>

            {/* Online Players */}
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">
                Players ({mc?.online_players ?? 0}/{mc?.max_players ?? 0})
              </h3>
              {mc?.player_names_online?.length > 0 ? (
                <ul className="list-disc list-inside text-sm">
                  {mc.player_names_online.map((player) => (
                    <li key={player}>{player}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No players online</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}