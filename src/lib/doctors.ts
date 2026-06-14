export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  availability: "Available" | "Busy" | "On Leave";
  nextAvailable: string | null;
  experience: string;
  image: string;
}

export const DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr Rajesh Kumar",
    department: "General Medicine",
    specialization: "Internal Medicine & General Practice",
    availability: "Available",
    nextAvailable: null,
    experience: "15 years",
    image: "/doctors/rk.svg",
  },
  {
    id: "doc-2",
    name: "Dr Priya Sharma",
    department: "Dermatology",
    specialization: "Clinical Dermatology & Cosmetology",
    availability: "Busy",
    nextAvailable: "2:30 PM",
    experience: "12 years",
    image: "/doctors/ps.svg",
  },
  {
    id: "doc-3",
    name: "Dr Anil Reddy",
    department: "Cardiology",
    specialization: "Interventional Cardiology",
    availability: "Available",
    nextAvailable: null,
    experience: "20 years",
    image: "/doctors/ar.svg",
  },
  {
    id: "doc-4",
    name: "Dr Sneha Patel",
    department: "Pediatrics",
    specialization: "Neonatology & Child Care",
    availability: "Available",
    nextAvailable: null,
    experience: "10 years",
    image: "/doctors/sp.svg",
  },
  {
    id: "doc-5",
    name: "Dr Arjun Rao",
    department: "Orthopedics",
    specialization: "Joint Replacement & Sports Medicine",
    availability: "On Leave",
    nextAvailable: "Tomorrow 10:00 AM",
    experience: "18 years",
    image: "/doctors/aro.svg",
  },
];

export function getDoctorByDepartment(department: string): Doctor | null {
  return DOCTORS.find((d) => d.department === department) || null;
}

export function getDoctorName(department: string): string {
  const doctor = getDoctorByDepartment(department);
  return doctor?.name || "Unassigned";
}
