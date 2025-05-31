import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function SystemStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://go-home-server.cloudflare-avatar-id-1.site/go-home-server/system/status")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setStatus(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch system status.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">CPU Usage</h2>
          <p>{status.cpu_usage_percent.toFixed(2)}%</p>
          <Progress value={status.cpu_usage_percent} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Memory Usage</h2>
          <p>
            {status.memory_used_mb}MB / {status.memory_total_mb}MB ({
              status.memory_used_percent.toFixed(2)
            }%)
          </p>
          <Progress value={status.memory_used_percent} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Disk Usage</h2>
          <p>
            {status.disk_used_gb}GB / {status.disk_total_gb}GB ({
              status.disk_used_percent.toFixed(2)
            }%)
          </p>
          <Progress value={status.disk_used_percent} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">System Info</h2>
          <p><strong>Network:</strong> {status.network_name}</p>
          <p><strong>Platform:</strong> {status.platform}</p>
          <p><strong>Version:</strong> {status.platform_version}</p>
          <p><strong>Uptime:</strong> {status.uptime}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Load Averages</h2>
          <p><strong>1m:</strong> {status.load_average1m}</p>
          <p><strong>5m:</strong> {status.load_average5m}</p>
          <p><strong>15m:</strong> {status.load_average15m}</p>
        </CardContent>
      </Card>
    </div>
  );
}
