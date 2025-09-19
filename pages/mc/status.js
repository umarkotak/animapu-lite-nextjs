"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Send, Sun, Moon, Users, MapPin, Gamepad2, Crown, Shield, Zap, CloudRain, Save, UserCheck, UserX, Clock, Globe, DownloadIcon, Play, Pause, Bomb, BombIcon } from "lucide-react";
import animapuApi from "@/apis/AnimapuApi";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

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
        <div className="flex items-center">
          <span className="text-2xl font-bold text-green-600">
            {uptimePercentage.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">uptime</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {onlineChecks}/{totalChecks}
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

        <div className="flex gap-1 justify-between text-xs text-muted-foreground">
          <span>{timeRange}</span>
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
  const [pingerStatus, setPingerStatus] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [rconResult, setRconResult] = useState("");
  const [rconCommand, setRconCommand] = useState("");
  const [isExecutingRcon, setIsExecutingRcon] = useState(false);
  const [teleportCoords, setTeleportCoords] = useState({ x: "", y: "", z: "" });
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [targetPlayer, setTargetPlayer] = useState("");
  const [backups, setBackups] = useState([])

  const searchParams = useSearchParams()

  const [showRcon, setShowRcon] = useState(false)
  useEffect(() => {
    GetBackups()
    if (searchParams && searchParams.get('rcon')) {
      setShowRcon(true)
    }
  }, [searchParams])

  const fetchRealtimeStatus = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${animapuApi.GoHomeServerHost}/go-home-server/minecraft/status`);
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      setRealtimeStatus(json?.data ?? null);
      setError(null);
    } catch {
      setError("Failed to fetch system status.");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchPingerStatus = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${animapuApi.GoHomeServerHost}/go-home-server/minecraft/pinger/status`);
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      setPingerStatus(json?.data ?? null);
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

  const ExecBackup = async () => {
    try {
      const uri = `${animapuApi.GoHomeServerHost}/go-home-server/minecraft/backup`;
      const res = await fetch(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        toast.error("Error executing Backup");
        return;
      }
      toast.success("Backup succeed");

    } catch (error) {
      toast.error("Failed to Backup");
      console.error("RCON Error:", error);
    }
  };

  const GetBackups = async () => {
    try {
      const uri = `${animapuApi.GoHomeServerHost}/go-home-server/minecraft/backups`;
      const res = await fetch(uri, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        toast.error("Error getting Backups");
        return;
      }

      const json = await res.json();

      setBackups(json.data)

    } catch (error) {
      toast.error("Failed to get Backups");
      console.error("RCON Error:", error);
    }
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
    fetchPingerStatus();
    fetchRealtimeStatus();
    const interval = setInterval(() => {
      fetchPingerStatus()
      fetchRealtimeStatus()
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!pingerStatus && isFetching) return <p className="p-4">Loading system status...</p>;
  if (error && !pingerStatus) return <p className="p-4 text-red-500">{error}</p>;

  const onlinePlayers = realtimeStatus?.player_names_online || [];

  return (
    <div className="space-y-4">
      {/* Header with Refresh Button and Indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Minecraft Server Console</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {(isFetching && !error) ? <p className="text-sm">updating</p> : <p className="text-sm">updated</p>}
            {error && <p className="text-sm text-red-500">Update failed!</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/mc/arena_builder">
          <Button size="sm" variant="outline">Arena Builder</Button>
        </Link>
        <Button size="sm" variant="outline" onClick={() => ExecBackup()}>Backup!</Button>
        <Drawer>
          <DrawerTrigger><Button size="sm" variant="outline">Backup List</Button></DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto max-w-80">
              <DrawerHeader>
                <DrawerTitle>Backups</DrawerTitle>
                <DrawerDescription>Download backup.</DrawerDescription>
              </DrawerHeader>

              <div className="flex flex-col gap-1 mb-4">
                {backups.map((backup) => (
                  <div key={backup}>
                    <a href={backup.url}><Button><DownloadIcon /> {backup.name}</Button></a>
                  </div>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Server Status Overview */}
      {pingerStatus && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block h-4 w-4 rounded-full ${
                      realtimeStatus?.online ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                    onClick={() => {window.location.replace("/mc/status?rcon=1")}}
                  />
                  <div>
                    <h2 className="text-xl font-semibold">
                      {realtimeStatus?.motd || "Minecraft Server"}
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono">
                      {realtimeStatus?.server_host}
                    </p>
                  </div>
                </div>
                <Badge variant={realtimeStatus?.online ? "default" : "destructive"} className="ml-4">
                  {realtimeStatus?.status}
                </Badge>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Version: {realtimeStatus?.version || "-"}</p>
                <p className="text-sm text-muted-foreground">Players: {realtimeStatus?.online_players ?? 0}/{realtimeStatus?.max_players ?? 0}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground font-mono">
              setelah login, silahkan kirim command ini untuk mulai bermain: /login admin123
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Server Stats */}
              <div className="col-span-3">
                <h3 className="font-semibold text-muted-foreground mb-3">Server Info</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Last Ping:</span>
                    <span>{timeAgo(pingerStatus?.last_ping_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Restart:</span>
                    <span>{timeAgo(pingerStatus?.last_restart_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restarts:</span>
                    <span>{pingerStatus?.restart_count}</span>
                  </div>
                </div>
              </div>

              {/* Uptime History */}
              <div className="col-span-6">
                <h3 className="font-semibold text-muted-foreground mb-3">Uptime History</h3>
                <UptimeStatusBar statusHistory={pingerStatus?.status_history} />
              </div>

              {/* Online Players */}
              <div className="col-span-3">
                <h3 className="font-semibold text-muted-foreground mb-3">Online Players</h3>
                {realtimeStatus?.player_names_online?.length > 0 ? (
                  <div className="space-y-1">
                    {realtimeStatus.player_names_online.map((player) => (
                      <div key={player} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">{player}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No players online</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RCON Console */}
      {showRcon && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Server Administration Console
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="world" className="w-full mb-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="world" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  World
                </TabsTrigger>
                <TabsTrigger value="players" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Players
                </TabsTrigger>
                <TabsTrigger value="server" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Server
                </TabsTrigger>
                <TabsTrigger value="console" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Console
                </TabsTrigger>
              </TabsList>

              {/* World Management */}
              <TabsContent value="world" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">World Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Time & Weather</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button
                          onClick={() => handleQuickCommand("time set day")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Sun className="mr-2 h-4 w-4" />
                          Set Day
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("time set night")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Moon className="mr-2 h-4 w-4" />
                          Set Night
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("weather clear")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Sun className="mr-2 h-4 w-4" />
                          Clear Sky
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("weather rain")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <CloudRain className="mr-2 h-4 w-4" />
                          Rain
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Game Rules</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleQuickCommand("gamerule doDaylightCycle false")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Freeze Day Cycle
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("gamerule doDaylightCycle true")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Enable Day Cycle
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("gamerule mobGriefing false")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Disable Mob Griefing
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("gamerule mobGriefing true")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <BombIcon className="mr-2 h-4 w-4" />
                          Enable Mob Griefing
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">World Management</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button
                          onClick={() => handleQuickCommand("save-all")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save World
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("save-all flush")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Force Save
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("reload")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reload Config
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Player Management */}
              <TabsContent value="players" className="space-y-6">
                {onlinePlayers.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Player Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Player</label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a player to manage" />
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

                      {selectedPlayer && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-muted-foreground">Managing:</span>
                            <Badge variant="secondary" className="font-mono">{selectedPlayer}</Badge>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Game Mode</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <Button
                                onClick={() => handlePlayerAction("survival", selectedPlayer)}
                                disabled={isExecutingRcon}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Survival
                              </Button>
                              <Button
                                onClick={() => handlePlayerAction("creative", selectedPlayer)}
                                disabled={isExecutingRcon}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                              >
                                <Gamepad2 className="mr-2 h-4 w-4" />
                                Creative
                              </Button>
                              <Button
                                onClick={() => handlePlayerAction("adventure", selectedPlayer)}
                                disabled={isExecutingRcon}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                              >
                                <MapPin className="mr-2 h-4 w-4" />
                                Adventure
                              </Button>
                              <Button
                                onClick={() => handlePlayerAction("spectator", selectedPlayer)}
                                disabled={isExecutingRcon}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Spectator
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium mb-3">Teleportation</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Teleport to Coordinates</label>
                                <div className="flex gap-2">
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
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Teleport
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Teleport to Player</label>
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
                                    <Users className="mr-2 h-4 w-4" />
                                    Teleport
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium mb-3">Administrative Actions</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Button
                                onClick={() => handlePlayerAction("op", selectedPlayer)}
                                disabled={isExecutingRcon}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                              >
                                <Crown className="mr-2 h-4 w-4" />
                                Make OP
                              </Button>
                              <Button
                                onClick={() => handlePlayerAction("deop", selectedPlayer)}
                                disabled={isExecutingRcon}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Remove OP
                              </Button>
                              <Button
                                onClick={() => handlePlayerAction("kick", selectedPlayer)}
                                disabled={isExecutingRcon}
                                variant="destructive"
                                size="sm"
                                className="justify-start"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Kick Player
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No players online to manage</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Server Management */}
              <TabsContent value="server" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Server Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Whitelist Controls</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button
                          onClick={() => handleQuickCommand("whitelist on")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Enable Whitelist
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("whitelist off")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Disable Whitelist
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("whitelist reload")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reload Whitelist
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Server Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleQuickCommand("list")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          List Players
                        </Button>
                        <Button
                          onClick={() => handleQuickCommand("whitelist list")}
                          disabled={isExecutingRcon}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Show Whitelist
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manual Console */}
              <TabsContent value="console" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Manual Command Console</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter RCON command (e.g., 'list', 'say Hello World', 'whitelist add playerName')"
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

                    <div className="text-xs text-muted-foreground">
                      <p><strong>Common commands:</strong></p>
                      <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li><code>say &lt;message&gt;</code> - Broadcast message to all players</li>
                        <li><code>whitelist add &lt;player&gt;</code> - Add player to whitelist</li>
                        <li><code>whitelist remove &lt;player&gt;</code> - Remove player from whitelist</li>
                        <li><code>ban &lt;player&gt;</code> - Ban a player</li>
                        <li><code>pardon &lt;player&gt;</code> - Unban a player</li>
                        <li><code>difficulty &lt;peaceful|easy|normal|hard&gt;</code> - Change difficulty</li>
                        <li><code>gamerule &lt;rule&gt; &lt;value&gt;</code> - Change game rules</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Result Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Command Output</CardTitle>
              </CardHeader>
              <CardContent>
                {rconResult ? (
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap border font-mono">
                    {rconResult}
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p>Execute a command to see the results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}