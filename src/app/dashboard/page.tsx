"use client";

import { useState, useEffect } from "react";
import { StatCards } from "@/components/appointment/StatCards";
import { AppointmentTable } from "@/components/appointment/AppointmentTable";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  RefreshCw,
} from "lucide-react";

interface Stats {
  total: number;
  today: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  by_department: Record<string, number>;
  by_language: Record<string, number>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Hospital AI Reception Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered appointment management system
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {today}
              </div>
              <Button variant="outline" size="sm" onClick={fetchStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading stats...</div>
        ) : stats ? (
          <StatCards
            total={stats.total}
            today={stats.today}
            pending={stats.pending}
            confirmed={stats.confirmed}
            completed={stats.completed}
            cancelled={stats.cancelled}
          />
        ) : null}

        <AppointmentTable />
      </main>
    </div>
  );
}