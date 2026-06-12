import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  patient_name: string;
  phone: string;
  reason: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  language: string;
  created_at: string;
};

async function getAppointments(): Promise<Appointment[]> {
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const appointments = await getAppointments();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Appointment Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hospital appointments</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-gray-900">No appointments yet</h2>
            <p className="text-gray-500 mt-1">Appointments will appear here once created.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Patient Name", "Phone", "Department", "Reason", "Date", "Time", "Language", "Created At"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appt.patient_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(appt.appointment_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.appointment_time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(appt.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
