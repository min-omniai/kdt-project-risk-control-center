import { useCallback, useEffect, useState } from "react";
import { teams as snapshotTeams, project } from "../data/projectData";
import { supabase } from "../lib/supabase";
import type { DashboardDataState, ScrumEntry, SyncedTeamPayload, Team } from "../types";

const initialState: DashboardDataState = {
  teams: snapshotTeams,
  scrumEntries: [],
  dataUpdatedAt: project.dataUpdatedAt,
  checkinUpdatedThrough: project.checkinUpdatedThrough,
  sourceMode: "snapshot",
  isLoading: true,
  error: "",
};

function isTeam(value: unknown): value is Team {
  if (!value || typeof value !== "object") return false;
  const team = value as Team;
  return (
    Number.isInteger(team.teamId) &&
    typeof team.company === "string" &&
    typeof team.teamName === "string" &&
    typeof team.progress === "number" &&
    typeof team.checkinRate === "number" &&
    Array.isArray(team.risks) &&
    Array.isArray(team.requiredQuestions) &&
    Array.isArray(team.checkinHistory)
  );
}

function isScrumEntry(value: unknown): value is ScrumEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as ScrumEntry;
  return (
    Number.isInteger(entry.teamId) &&
    typeof entry.teamName === "string" &&
    typeof entry.learnerName === "string" &&
    typeof entry.date === "string" &&
    typeof entry.workload === "string" &&
    typeof entry.comment === "string" &&
    typeof entry.note === "string" &&
    typeof entry.status === "string"
  );
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function useDashboardData(): DashboardDataState {
  const [state, setState] = useState<DashboardDataState>(initialState);

  const loadLatest = useCallback(async () => {
    if (!supabase) {
      setState((current) => ({ ...current, isLoading: false }));
      return;
    }

    const { data, error } = await supabase
      .from("team_daily_status")
      .select("team_id, recorded_date, payload, updated_at")
      .order("recorded_date", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(80);

    if (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: "실시간 데이터를 불러오지 못해 마지막 스냅샷을 표시합니다.",
      }));
      return;
    }

    const latestByTeam = new Map<number, (typeof data)[number]>();
    data?.forEach((row) => {
      if (!latestByTeam.has(row.team_id)) latestByTeam.set(row.team_id, row);
    });

    const liveTeams = [...latestByTeam.values()]
      .flatMap((row): Team[] => {
        const payload = row.payload as SyncedTeamPayload | null;
        if (!isTeam(payload?.dashboard)) return [];

        return [{
          ...payload.dashboard,
          riskSourceText: [
            payload.source?.briefing,
            payload.source?.specialNotes,
            payload.source?.operatorFeedback,
            payload.source?.gptSummary,
          ].filter(Boolean).join("\n"),
        }];
      })
      .sort((a, b) => a.teamId - b.teamId);

    const scrumEntries = [...latestByTeam.values()]
      .flatMap((row) => {
        const payload = row.payload as SyncedTeamPayload | null;
        return Array.isArray(payload?.scrumEntries) ? payload.scrumEntries : [];
      })
      .filter(isScrumEntry)
      .sort((a, b) => b.date.localeCompare(a.date) || a.learnerName.localeCompare(b.learnerName));

    if (liveTeams.length !== 8) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: liveTeams.length
          ? `동기화 데이터가 ${liveTeams.length}/8팀만 있어 기존 스냅샷을 표시합니다.`
          : "아직 Supabase 동기화 데이터가 없어 기존 스냅샷을 표시합니다.",
      }));
      return;
    }

    const rows = [...latestByTeam.values()];
    const latestUpdate = rows.reduce(
      (latest, row) => (row.updated_at > latest ? row.updated_at : latest),
      rows[0].updated_at,
    );
    const latestRecordedDate = rows.reduce(
      (latest, row) => (row.recorded_date > latest ? row.recorded_date : latest),
      rows[0].recorded_date,
    );

    setState({
      teams: liveTeams,
      scrumEntries,
      dataUpdatedAt: formatTimestamp(latestUpdate),
      checkinUpdatedThrough: latestRecordedDate,
      sourceMode: "live",
      isLoading: false,
      error: "",
    });
  }, []);

  useEffect(() => {
    void loadLatest();
    if (!supabase) return;
    const client = supabase;

    const channel = client
      .channel("team-daily-status-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_daily_status" },
        () => void loadLatest(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [loadLatest]);

  return state;
}
