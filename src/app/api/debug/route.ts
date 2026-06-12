import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const urlSet = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) + "..."
    : "not set";

  const { data, error, count } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: false })
    .order("created_at", { ascending: false });

  return NextResponse.json({
    connection: {
      url: urlSet ? "configured" : "missing",
      key: keySet ? "configured" : "missing",
      keyPrefix,
    },
    query: {
      success: !error,
      recordsFound: data?.length ?? 0,
      count,
      firstRecord: data && data.length > 0 ? data[0] : null,
    },
    error: error
      ? { message: error.message, details: error.details, hint: error.hint, code: error.code }
      : null,
  });
}
