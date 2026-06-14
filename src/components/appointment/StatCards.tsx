"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface StatCardsProps {
  total: number;
  today: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

const cards = [
  {
    key: "total",
    label: "Total Appointments",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "today",
    label: "Today's Appointments",
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "pending",
    label: "Pending",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: TrendingUp,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export function StatCards({
  total,
  today,
  pending,
  confirmed,
  completed,
  cancelled,
}: StatCardsProps) {
  const values: Record<string, number> = {
    total,
    today,
    pending,
    confirmed,
    completed,
    cancelled,
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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