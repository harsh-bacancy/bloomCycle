import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (value: unknown) => {
    const text = value == null ? "" : String(value);
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => esc(row[header])).join(",")),
  ].join("\n");
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exportInsert = await supabase
    .from("data_exports")
    .insert({ user_id: user.id, export_type: "cycle_pregnancy", status: "processing" })
    .select("id")
    .maybeSingle();

  const exportId = exportInsert.data?.id;

  try {
    const [{ data: cycles }, { data: symptoms }, { data: pregnancies }] = await Promise.all([
      supabase
        .from("menstrual_cycles")
        .select("id, cycle_start_date, cycle_end_date, average_cycle_length, flow_intensity, notes, created_at")
        .eq("user_id", user.id)
        .order("cycle_start_date", { ascending: false }),
      supabase
        .from("symptoms")
        .select("id, date, type, label, intensity, metadata, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("pregnancies")
        .select("id, lmp_date, estimated_due_date, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const pregnancyIds = (pregnancies ?? []).map((item) => item.id);
    const { data: pregnancyLogs } = pregnancyIds.length
      ? await supabase
          .from("pregnancy_logs")
          .select("id, pregnancy_id, week_number, weight, notes, logged_at")
          .in("pregnancy_id", pregnancyIds)
          .order("logged_at", { ascending: false })
      : { data: [] };

    const sections = [
      "# menstrual_cycles",
      toCsv((cycles ?? []) as Array<Record<string, unknown>>),
      "",
      "# symptoms",
      toCsv((symptoms ?? []) as Array<Record<string, unknown>>),
      "",
      "# pregnancies",
      toCsv((pregnancies ?? []) as Array<Record<string, unknown>>),
      "",
      "# pregnancy_logs",
      toCsv((pregnancyLogs ?? []) as Array<Record<string, unknown>>),
    ];

    const csv = sections.join("\n");

    if (exportId) {
      await supabase.from("data_exports").update({ status: "ready" }).eq("id", exportId).eq("user_id", user.id);
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bloomcycle-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    if (exportId) {
      await supabase
        .from("data_exports")
        .update({ status: "failed", error: error instanceof Error ? error.message : "Export failed" })
        .eq("id", exportId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
