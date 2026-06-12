"use client";

import { useState } from "react";
import type { Appointment, DashboardStats } from "./page";

type Props = {
  appointments: Appointment[];
  stats: DashboardStats;
  isDemo: boolean;
  queryError: string | null;
  recordsCount: number;
};

const DEPARTMENTS = [
  "All Departments",
  "General Medicine",
  "Ophthalmology",
  "Gynecology",
  "Dermatology",
  "Pediatrics",
  "Cardiology",
  "Orthopedics",
  "ENT",
];

const STATUSES = ["All Status", "Pending", "Confirmed", "Cancelled"];

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide";
  switch (status) {
    case "Confirmed":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confirmed
        </span>
      );
    case "Cancelled":
      return (
        <span className={`${base} bg-red-50 text-red-700 ring-1 ring-red-600/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`${base} bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Pending
        </span>
      );
  }
}

function StatCard({ icon, value, label, sub }: { icon: string; value: number | string; label: string; sub?: string }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-healthcare-50 to-healthcare-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ appointments, stats, isDemo, queryError, recordsCount }: Props) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const filtered = appointments.filter((a) => {
    const matchSearch =
      !search ||
      a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);
    const matchDept = department === "All Departments" || a.department === department;
    const matchStatus = statusFilter === "All Status" || a.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-gradient-to-r from-healthcare-800 via-healthcare-700 to-healthcare-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Hospital AI Reception Dashboard</h1>
                  <p className="text-healthcare-200 text-sm mt-0.5">AI-powered appointment management system</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 text-healthcare-100 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {today}
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-xs font-medium text-healthcare-100">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {queryError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">Database connection error</p>
                <p className="text-sm text-red-600 mt-0.5">{queryError}</p>
              </div>
            </div>
          </div>
        )}

        {isDemo && !queryError && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Demo Mode</p>
                <p className="text-sm text-blue-600 mt-0.5">
                  {recordsCount === 0
                    ? "No appointments in database yet. Showing sample data below. Real records will appear automatically once created."
                    : "Showing sample appointments for preview. Real data from AI voice calls will appear automatically."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📋" value={stats.total} label="Total Appointments" sub={isDemo ? "Demo data" : "All time"} />
          <StatCard icon="⏳" value={stats.pending} label="Pending Confirmations" sub={isDemo ? "Demo data" : "Requires action"} />
          <StatCard icon="📞" value={stats.todayCalls} label="Today&apos;s Calls" sub={isDemo ? "Demo data" : new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} />
          <StatCard icon="🏥" value={stats.departments} label="Departments Served" sub={isDemo ? "Demo data" : "Active departments"} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search patient by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-500 transition-all"
              />
            </div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-500 transition-all appearance-none cursor-pointer"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-500 transition-all appearance-none cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {(search || department !== "All Departments" || statusFilter !== "All Status") && (
              <button
                onClick={() => { setSearch(""); setDepartment("All Departments"); setStatusFilter("All Status"); }}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 sm:p-16">
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-healthcare-50 to-healthcare-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-healthcare-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">No appointments found</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  {isDemo
                    ? "Demo data is not available for this filter combination."
                    : "No appointments match your current filters. Try adjusting your search or filter criteria."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/80">
                    <tr>
                      {["Patient Name", "Phone", "Department", "Reason", "Date", "Time", "Language", "Status", "Created At"].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((appt) => (
                      <tr key={appt.id} className="hover:bg-healthcare-50/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-healthcare-400 to-healthcare-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {appt.patient_name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{appt.patient_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{appt.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[140px] truncate">{appt.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(appt.appointment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.appointment_time}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium ring-1 ring-gray-200">
                            {appt.language}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={appt.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(appt.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-gray-700">{appointments.length}</span> appointment{appointments.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-400">{isDemo ? "Demo data" : "Live data"}</p>
              </div>
            </div>
          )}
        </div>

        {isDemo && !queryError && (
          <div className="bg-gradient-to-br from-healthcare-600 to-healthcare-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Ready to go live?</h2>
                <p className="text-healthcare-200 text-sm mt-1 max-w-md">
                  Connect your AI voice calling system to start receiving real appointments automatically.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-healthcare-700 rounded-xl text-sm font-semibold hover:bg-healthcare-50 transition-all shadow-sm whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect AI Reception
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
