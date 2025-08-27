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

const UptimeStatusBar = ({ statusHistory }) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-2">
        <p className="text-sm">No uptime history available</p>
      </div>
    );
  }

  const totalChecks = statusHistory.length;
  const onlineChecks = statusHistory.filter(entry => entry.online).length;
  const uptimePercentage = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 0;

  const oldestTime = statusHistory[0]?.time;
  const newestTime = statusHistory[statusHistory.length - 1]?.time;
  const timeRange = oldestTime && newestTime ?
    `${timeAgo(oldestTime)} - ${timeAgo(newestTime)}` :
    "Unknown range";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="text-2xl font-bold text-green-600">
            {uptimePercentage.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">uptime</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {onlineChecks}/{totalChecks} checks online
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1 overflow-hidden">
          {statusHistory.map((entry, index) => {
            const date = new Date(entry.time);
            const tooltip = `${entry.online ? 'Online' : 'Offline'} at ${date.toLocaleTimeString()}`;

            return (
              <div
                key={index}
                className={`flex-1 min-w-[2px] h-8 rounded-sm transition-all hover:scale-y-110 cursor-help ${
                  entry.online
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                title={tooltip}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Oldest</span>
          <span>{timeRange}</span>
          <span>Latest</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
};

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [rconResult, setRconResult] = useState("");
  const [rconCommand, setRconCommand] = useState("");
  const [isExecutingRcon, setIsExecutingRcon] = useState(false);
  const [teleportCoords, setTeleportCoords] = useState({ x: "", y: "", z: "" });
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [targetPlayer, setTargetPlayer] = useState("");

  const searchParams = useSearchParams()

  const [showRcon, setShowRcon] = useState(false)
  useEffect(() => {
    if (searchParams && searchParams.get('rcon')) {
      setShowRcon(true)
    }
  }, [searchParams])

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

  const handleRconSubmit = () => {
    ExecRcon(rconCommand);
  };

  const handleQuickCommand = (command) => {
    ExecRcon(command);
  };

  const handlePlayerAction = (action, player) => {
    let command = "";
    switch (action) {
      case "creative":
        command = `gamemode creative ${player}`;
        break;
      case "survival":
        command = `gamemode survival ${player}`;
        break;
      case "adventure":
        command = `gamemode adventure ${player}`;
        break;
      case "spectator":
        command = `gamemode spectator ${player}`;
        break;
      case "op":
        command = `op ${player}`;
        break;
      case "deop":
        command = `deop ${player}`;
        break;
      case "kick":
        command = `kick ${player}`;
        break;
      case "teleport":
        if (teleportCoords.x && teleportCoords.y && teleportCoords.z) {
          command = `tp ${player} ${teleportCoords.x} ${teleportCoords.y} ${teleportCoords.z}`;
        } else {
          toast.error("Please set teleport coordinates");
          return;
        }
        break;
      case "teleport_to_player":
        if (targetPlayer) {
          command = `tp ${player} ${targetPlayer}`;
        } else {
          toast.error("Please select a target player");
          return;
        }
        break;
      default:
        return;
    }
    ExecRcon(command);
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
  const onlinePlayers = mc?.player_names_online || [];

  return (
    <div className="">
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

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
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
      </div>

      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
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

              <div className="flex flex-col lg:flex-row justify-between gap-6">
                {/* Left side: Status & Version */}
                <div className="flex-shrink-0">
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

                {/* Middle: Uptime Status Bar */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-muted-foreground mb-2">Uptime History</h3>
                  <UptimeStatusBar statusHistory={mc?.status_history} />
                </div>

                {/* Right side: Online Players */}
                <div className="flex-shrink-0">
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

        {/* Enhanced RCON Command Interface */}
        {showRcon && (
          <Card className="lg:col-span-4 md:col-span-2">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">RCON Console</h2>

              {/* Quick Utility Buttons */}
              <div className="mb-6">
                <h3 className="font-semibold text-muted-foreground mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleQuickCommand("time set day")}
                    disabled={isExecutingRcon}
                    variant="outline"
                    size="sm"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Set Day
                  </Button>
                  <Button
                    onClick={() => handleQuickCommand("time set night")}
                    disabled={isExecutingRcon}
                    variant="outline"
                    size="sm"
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Set Night
                  </Button>
                  <Button
                    onClick={() => handleQuickCommand("weather clear")}
                    disabled={isExecutingRcon}
                    variant="outline"
                    size="sm"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Clear Weather
                  </Button>
                  <Button
                    onClick={() => handleQuickCommand("weather rain")}
                    disabled={isExecutingRcon}
                    variant="outline"
                    size="sm"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Rain
                  </Button>
                  <Button
                    onClick={() => handleQuickCommand("list")}
                    disabled={isExecutingRcon}
                    variant="outline"
                    size="sm"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    List Players
                  </Button>
                  <Button
                    onClick={() => handleQuickCommand("save-all")}
                    disabled={isExecutingRcon}
                    variant="outline"
                    size="sm"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Save World
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Player Management Section */}
              {onlinePlayers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-muted-foreground mb-3">Player Management</h3>
                  
                  {/* Player Selection */}
                  <div className="mb-4">
                    <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                      <SelectTrigger className="w-full mb-2">
                        <SelectValue placeholder="Select a player to manage" />
                      </SelectTrigger>
                      <SelectContent>
                        {onlinePlayers.map((player) => (
                          <SelectItem key={player} value={player}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {player}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Player Action Buttons */}
                  {selectedPlayer && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Game Mode Actions for <Badge variant="secondary">{selectedPlayer}</Badge></h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handlePlayerAction("creative", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <Gamepad2 className="mr-1 h-3 w-3" />
                            Creative
                          </Button>
                          <Button
                            onClick={() => handlePlayerAction("survival", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            Survival
                          </Button>
                          <Button
                            onClick={() => handlePlayerAction("adventure", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <MapPin className="mr-1 h-3 w-3" />
                            Adventure
                          </Button>
                          <Button
                            onClick={() => handlePlayerAction("spectator", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <Users className="mr-1 h-3 w-3" />
                            Spectator
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Admin Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handlePlayerAction("op", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <Crown className="mr-1 h-3 w-3" />
                            Make OP
                          </Button>
                          <Button
                            onClick={() => handlePlayerAction("deop", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <Users className="mr-1 h-3 w-3" />
                            Remove OP
                          </Button>
                          <Button
                            onClick={() => handlePlayerAction("kick", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="destructive"
                            size="sm"
                          >
                            Kick Player
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Teleport Actions</h4>
                        
                        {/* Coordinate Teleport */}
                        <div className="flex gap-2 mb-2">
                          <Input
                            type="number"
                            placeholder="X"
                            value={teleportCoords.x}
                            onChange={(e) => setTeleportCoords(prev => ({ ...prev, x: e.target.value }))}
                            className="w-20"
                          />
                          <Input
                            type="number"
                            placeholder="Y"
                            value={teleportCoords.y}
                            onChange={(e) => setTeleportCoords(prev => ({ ...prev, y: e.target.value }))}
                            className="w-20"
                          />
                          <Input
                            type="number"
                            placeholder="Z"
                            value={teleportCoords.z}
                            onChange={(e) => setTeleportCoords(prev => ({ ...prev, z: e.target.value }))}
                            className="w-20"
                          />
                          <Button
                            onClick={() => handlePlayerAction("teleport", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <MapPin className="mr-1 h-3 w-3" />
                            TP to Coords
                          </Button>
                        </div>

                        {/* Player to Player Teleport */}
                        <div className="flex gap-2">
                          <Select value={targetPlayer} onValueChange={setTargetPlayer}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select target player" />
                            </SelectTrigger>
                            <SelectContent>
                              {onlinePlayers
                                .filter(player => player !== selectedPlayer)
                                .map((player) => (
                                  <SelectItem key={player} value={player}>
                                    {player}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handlePlayerAction("teleport_to_player", selectedPlayer)}
                            disabled={isExecutingRcon}
                            variant="outline"
                            size="sm"
                          >
                            <Users className="mr-1 h-3 w-3" />
                            TP to Player
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-6" />

              {/* Manual Command Input */}
              <div className="mb-4">
                <h3 className="font-semibold text-muted-foreground mb-3">Manual Command</h3>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter RCON command (e.g., 'list', 'say Hello World')"
                    value={rconCommand}
                    onChange={(e) => setRconCommand(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        ExecRcon(rconCommand);
                      }
                    }}
                    disabled={isExecutingRcon}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => ExecRcon(rconCommand)}
                    disabled={isExecutingRcon || !rconCommand.trim()}
                    variant="default"
                  >
                    <Send className={`mr-2 h-4 w-4 ${isExecutingRcon ? "animate-spin" : ""}`} />
                    Execute
                  </Button>
                </div>
              </div>

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
                  <p>Execute a command to see the results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}