"use client";

import { useState, useEffect } from "react";
import { StatCards } from "@/components/appointment/StatCards";
import { AppointmentTable } from "@/components/appointment/AppointmentTable";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, CheckCircle2 } from "lucide-react";

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

  const handleRefresh = async () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                  AI System Active
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                CarePoint Medical Center
              </h1>
              <p className="text-base text-slate-500 mt-1 font-medium">
                AI Reception & Appointment Management
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Voice Calls Handled Automatically</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Appointment Booking Automation</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Real-time Patient Dashboard</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                {today}
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="border-slate-200">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Loading stats...
          </div>
        ) : stats ? (
          <StatCards
            total={stats.total}
            today={stats.today}
            pending={stats.pending}
            confirmed={stats.confirmed}
            completed={stats.completed}
            cancelled={stats.cancelled}
            departments={Object.keys(stats.by_department).length}
          />
        ) : null}

        <AppointmentTable />
      </main>
    </div>
  );
}