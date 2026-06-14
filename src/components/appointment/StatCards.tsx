"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarCheck, Phone, Building2 } from "lucide-react";

interface StatCardsProps {
  total: number;
  today: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  departments?: number;
}

const cards = [
  {
    key: "today",
    label: "Today's Patients",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    key: "total",
    label: "Appointments Booked",
    icon: CalendarCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    key: "pending",
    label: "AI Calls Handled",
    icon: Phone,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    key: "departments",
    label: "Departments Active",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
];

export function StatCards({
  total,
  today,
  pending,
  confirmed,
  completed,
  cancelled,
  departments = 0,
}: StatCardsProps) {
  const values: Record<string, number> = {
    total,
    today,
    pending,
    confirmed,
    completed,
    cancelled,
    departments,
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.key}
          className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-slate-100"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {values[card.key]}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} border ${card.border}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}