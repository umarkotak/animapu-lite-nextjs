"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Send } from "lucide-react";
import animapuApi from "@/apis/AnimapuApi";
import { toast } from "react-toastify";

const StatCard = ({ title, children, className = "" }) => (
  <Card className={className}>
    <CardContent className="p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
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
  const [isFetching, setIsFetching] = useState(true);
  const [rconResult, setRconResult] = useState("");
  const [rconCommand, setRconCommand] = useState("");
  const [isExecutingRcon, setIsExecutingRcon] = useState(false);

  const fetchStatus = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${animapuApi.GoHomeServerHost}/go-home-server/system/status`);
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      setStatus(json?.data ?? null);
      setError(null);
    } catch {
      setError("Failed to fetch system status.");
    } finally {
      setIsFetching(false);
    }
  };

  const ExecRcon = async (command) => {
    if (!command.trim()) {
      toast.error("Please enter a command");
      return;
    }

    setIsExecutingRcon(true);
    try {
      const uri = `${animapuApi.GoHomeServerHost}/go-home-server/minecraft/rcon`;
      const res = await fetch(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command,
        })
      });

      if (!res.ok) {
        toast.error("Error executing RCON command");
        return;
      }

      const json = await res.json();
      setRconResult(JSON.stringify(json, null, 2));
      toast.success("RCON command executed successfully");
    } catch (error) {
      toast.error("Failed to execute RCON command");
      console.error("RCON Error:", error);
    } finally {
      setIsExecutingRcon(false);
    }
  };

  const handleRconSubmit = (e) => {
    e.preventDefault();
    ExecRcon(rconCommand);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!status && isFetching) return <p className="p-4">Loading system status...</p>;
  if (error && !status) return <p className="p-4 text-red-500">{error}</p>;

  const s = status;
  const mc = s?.minecraft_server_status;

  return (
    <div className="p-4">
      {/* Header with Refresh Button and Indicator */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">System Status</h1>
        <div className="flex items-center gap-2">
          {isFetching && !error && <p className="text-sm text-muted-foreground">Updating...</p>}
          {error && <p className="text-sm text-red-500">Update failed!</p>}
          <Button onClick={fetchStatus} disabled={isFetching} variant="outline" size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="CPU Usage">
          <p className="text-2xl font-bold">{s?.cpu_usage_percent?.toFixed(1) ?? "N/A"}%</p>
          <Progress value={s?.cpu_usage_percent ?? 0} className="mt-2" />
        </StatCard>

        <StatCard title="Memory Usage">
          <p className="text-2xl font-bold">{s?.memory_used_percent?.toFixed(1) ?? "N/A"}%</p>
          <p className="text-sm text-muted-foreground">
            {s?.memory_used_mb ?? "?"}MB / {s?.memory_total_mb ?? "?"}MB
          </p>
          <Progress value={s?.memory_used_percent ?? 0} className="mt-2" />
        </StatCard>

        <StatCard title="Disk Usage">
          <p className="text-2xl font-bold">{s?.disk_used_percent?.toFixed(1) ?? "N/A"}%</p>
          <p className="text-sm text-muted-foreground">
            {s?.disk_used_gb ?? "?"}GB / {s?.disk_total_gb ?? "?"}GB
          </p>
          <Progress value={s?.disk_used_percent ?? 0} className="mt-2" />
        </StatCard>

        <StatCard title="System & Load">
          <p className="text-sm"><strong>Uptime:</strong> {s?.uptime ?? "-"}</p>
          <p className="text-sm"><strong>Platform:</strong> {s?.platform ?? "-"} {s?.platform_version ?? ""}</p>
          <p className="text-sm"><strong>Network:</strong> {s?.network_name ?? "-"}</p>
        </StatCard>

        {mc && (
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

              <div className="flex flex-col sm:flex-row justify-between gap-4">
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
                  <p className="text-sm"><strong>Version:</strong> {mc?.version || "-"}</p>
                  <p className="text-sm"><strong>Last Ping:</strong> {timeAgo(mc?.last_ping_at)}</p>
                  <p className="text-sm"><strong>Last Restart:</strong> {timeAgo(mc?.last_restart_at)}</p>
                  <p className="text-sm"><strong>Restart Count:</strong> {mc?.restart_count}</p>
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
        )}

        {/* RCON Command Interface */}
        <Card className="lg:col-span-4 md:col-span-2">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">RCON Console</h2>

            {/* Command Input Form */}
            <form onSubmit={handleRconSubmit} className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter RCON command (e.g., 'list', 'say Hello World')"
                  value={rconCommand}
                  onChange={(e) => setRconCommand(e.target.value)}
                  disabled={isExecutingRcon}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isExecutingRcon || !rconCommand.trim()}
                  variant="default"
                >
                  <Send className={`mr-2 h-4 w-4 ${isExecutingRcon ? "animate-spin" : ""}`} />
                  Execute
                </Button>
              </div>
            </form>

            {/* Result Display */}
            {rconResult && (
              <div>
                <h3 className="font-semibold text-muted-foreground mb-2">Result:</h3>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap border">
                  {rconResult}
                </pre>
              </div>
            )}

            {!rconResult && (
              <div className="text-center text-muted-foreground py-8">
                <p>Enter an RCON command above to see the results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}