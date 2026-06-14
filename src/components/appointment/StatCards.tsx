"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  Phone,
  Building2,
} from "lucide-react";

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
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    key: "total",
    label: "Appointments Booked",
    icon: CalendarCheck,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    key: "pending",
    label: "AI Calls Handled",
    icon: Phone,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    key: "departments",
    label: "Departments Active",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950",
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
        <Card key={card.key} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{values[card.key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}