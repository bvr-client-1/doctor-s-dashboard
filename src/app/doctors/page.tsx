"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DOCTORS } from "@/lib/doctors";
import {
  ArrowLeft,
  Clock,
  Stethoscope,
  Award,
  Calendar,
} from "lucide-react";
import Link from "next/link";

function AvailabilityBadge({
  availability,
}: {
  availability: "Available" | "Busy" | "On Leave";
}) {
  const config = {
    Available: {
      label: "Available",
      className:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100",
    },
    Busy: {
      label: "Busy",
      className:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100",
    },
    "On Leave": {
      label: "On Leave",
      className:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100",
    },
  };

  const c = config[availability];
  return (
    <Badge variant="outline" className={c.className}>
      {availability === "Available" && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
      )}
      {availability === "Busy" && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
      )}
      {availability === "On Leave" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
      )}
      {c.label}
    </Badge>
  );
}

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Our Doctors
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Meet our expert medical team at Apollo Care Hospitals
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {DOCTORS.map((doctor) => (
            <Card
              key={doctor.id}
              className="hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {doctor.name
                      .replace("Dr ", "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {doctor.specialization}
                    </p>
                    <div className="mt-2">
                      <AvailabilityBadge availability={doctor.availability} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{doctor.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">{doctor.experience}</span>
                </div>
                {doctor.nextAvailable && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Next Available:
                    </span>
                    <span className="font-medium">{doctor.nextAvailable}</span>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <Button
                    className="w-full"
                    variant={
                      doctor.availability === "Available" ? "default" : "outline"
                    }
                    disabled={doctor.availability === "On Leave"}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {doctor.availability === "Available"
                      ? "Book Appointment"
                      : doctor.availability === "Busy"
                      ? "Join Waitlist"
                      : "Currently Unavailable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}