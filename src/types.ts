export type RiskLevel = "Normal" | "Caution" | "Warning" | "Critical";
export type RiskKey =
  | "scheduleRisk"
  | "planningRisk"
  | "technicalRisk"
  | "healthRisk"
  | "collaborationRisk";

export interface Milestone {
  name: string;
  date: string;
  status: "completed" | "upcoming";
}

export interface Team {
  teamId: number;
  company: string;
  teamName: string;
  progress: number;
  checkinRate: number;
  healthRisk: boolean;
  scheduleRisk: boolean;
  planningRisk: boolean;
  technicalRisk: boolean;
  collaborationRisk: boolean;
  status: string;
  goodPoints: string[];
  risks: string[];
  specialNotes: string[];
  requiredQuestions: string[];
  checkinHistory: {
    date: string;
    rate: number;
  }[];
}

export interface SyncedTeamPayload {
  dashboard: Team;
  source: {
    briefing: string;
    specialNotes: string;
    operatorFeedback: string;
    gptSummary: string;
  };
  syncedAt: string;
}

export interface DashboardDataState {
  teams: Team[];
  dataUpdatedAt: string;
  checkinUpdatedThrough: string;
  sourceMode: "live" | "snapshot";
  isLoading: boolean;
  error: string;
}
