"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { getDoctorName } from "@/lib/doctors";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  FileText,
  User,
  Activity,
  Mic,
  Bot,
  Stethoscope,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  reason: string | null;
  department: string;
  appointment_date: string | null;
  appointment_time: string | null;
  language: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  source: string;
  call_duration: string | null;
  notes: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

const STATUSES = [
  "All Status",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function SourceBadge({ source }: { source: string }) {
  if (source === "AI Voice Agent") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
        <Mic className="h-3 w-3" />
        AI
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
      {source}
    </span>
  );
}

function DepartmentBadge({ department }: { department: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
      {department}
    </span>
  );
}

export function AppointmentTable() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (department !== "All Departments") params.set("department", department);
        if (status !== "All Status") params.set("status", status);
        params.set("page", page.toString());
        params.set("limit", "10");

        const res = await fetch(`/api/appointments?${params.toString()}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, department, status, page]);

  const handleView = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setViewModalOpen(true);
  };

  const handleEdit = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setEditForm({ ...appt });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setDeleteModalOpen(true);
  };

  const refetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (department !== "All Departments") params.set("department", department);
      if (status !== "All Status") params.set("status", status);
      params.set("page", page.toString());
      params.set("limit", "10");
      const res = await fetch(`/api/appointments?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!selectedAppointment) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditModalOpen(false);
        refetch();
      }
    } catch (err) {
      console.error("Failed to update appointment:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppointment) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedAppointment(null);
        refetch();
      }
    } catch (err) {
      console.error("Failed to delete appointment:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
    setPage(1);
  };

  const hasFilters = search || department !== "All Departments" || status !== "All Status";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 border-slate-200"
          />
        </div>
        <Select
          value={department}
          onValueChange={(val) => {
            setDepartment(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] border-slate-200">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px] border-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "All Status"
                  ? "All Status"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2 text-slate-600">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Patient</TableHead>
              <TableHead className="font-semibold text-slate-700">Phone</TableHead>
              <TableHead className="font-semibold text-slate-700">Department</TableHead>
              <TableHead className="font-semibold text-slate-700">Reason</TableHead>
              <TableHead className="font-semibold text-slate-700">Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Time</TableHead>
              <TableHead className="font-semibold text-slate-700">Language</TableHead>
              <TableHead className="font-semibold text-slate-700">Source</TableHead>
              <TableHead className="font-semibold text-slate-700">Doctor</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.appointments.length ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-slate-500">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              data.appointments.map((appt) => (
                <TableRow key={appt.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {getInitials(appt.patient_name)}
                      </div>
                      <span className="font-semibold text-slate-900">{appt.patient_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-500">
                    {appt.phone}
                  </TableCell>
                  <TableCell>
                    <DepartmentBadge department={appt.department} />
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-slate-600">
                    {appt.reason || "—"}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {appt.appointment_date
                      ? formatDate(appt.appointment_date)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-slate-700">{appt.appointment_time || "—"}</TableCell>
                  <TableCell className="text-slate-600">{appt.language}</TableCell>
                  <TableCell>
                    <SourceBadge source={appt.source || "AI Voice Agent"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">
                        {getDoctorName(appt.department)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={appt.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(appt)}
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(appt)}
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(appt)}
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(data.page - 1) * data.limit + 1}–
            {Math.min(data.page * data.limit, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-slate-700">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="border-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Modal - Appointment Details */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="h-5 w-5 text-blue-600" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedAppointment?.patient_name}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              {selectedAppointment.summary && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-800">AI Summary</p>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {selectedAppointment.summary}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Name</p>
                    <p className="font-semibold text-slate-900">{selectedAppointment.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Phone</p>
                    <p className="font-semibold text-slate-900 font-mono">{selectedAppointment.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Language</p>
                    <p className="font-semibold text-slate-900">{selectedAppointment.language}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Status</p>
                    <StatusBadge status={selectedAppointment.status} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Information
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Department</p>
                    <p className="font-semibold text-slate-900">{selectedAppointment.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Reason</p>
                    <p className="font-semibold text-slate-900">{selectedAppointment.reason || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Date</p>
                    <p className="font-semibold text-slate-900">
                      {selectedAppointment.appointment_date
                        ? formatDate(selectedAppointment.appointment_date)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Time</p>
                    <p className="font-semibold text-slate-900">{selectedAppointment.appointment_time || "—"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Assigned Doctor
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {getDoctorName(selectedAppointment.department)
                        .replace("Dr ", "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {getDoctorName(selectedAppointment.department)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {selectedAppointment.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Booking Source
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <SourceBadge source={selectedAppointment.source || "AI Voice Agent"} />
                  {selectedAppointment.call_duration && (
                    <p className="text-sm text-slate-500 mt-2">
                      Call Duration: {selectedAppointment.call_duration}
                    </p>
                  )}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-700">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>ID: {selectedAppointment.id.slice(0, 8)}...</span>
                <span>Created: {formatDate(selectedAppointment.created_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Edit Appointment</DialogTitle>
            <DialogDescription>
              Update appointment information for {selectedAppointment?.patient_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Patient Name</label>
                <Input
                  value={editForm.patient_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, patient_name: e.target.value })
                  }
                  className="border-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Phone</label>
                <Input
                  value={editForm.phone || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="border-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Department</label>
                <Select
                  value={editForm.department || ""}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, department: val })
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <Select
                  value={editForm.status || ""}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, status: val as Appointment["status"] })
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Date</label>
                <Input
                  type="date"
                  value={editForm.appointment_date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, appointment_date: e.target.value })
                  }
                  className="border-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Time</label>
                <Input
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={editForm.appointment_time || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, appointment_time: e.target.value })
                  }
                  className="border-slate-200"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold text-slate-700">Reason</label>
                <Input
                  value={editForm.reason || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, reason: e.target.value })
                  }
                  className="border-slate-200"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold text-slate-700">Notes</label>
                <Input
                  value={editForm.notes || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)} className="border-slate-200">
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-slate-900">Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the appointment for{" "}
              <strong>{selectedAppointment?.patient_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}