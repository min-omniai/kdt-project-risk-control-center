import type { RiskLevel, Team } from "../types";

export function calculateRiskScore(team: Team): number {
  const score =
    (team.planningRisk ? 30 : 0) +
    (team.scheduleRisk ? 25 : 0) +
    (team.technicalRisk ? 25 : 0) +
    (team.healthRisk ? 10 : 0) +
    (team.collaborationRisk ? 10 : 0) +
    (team.checkinRate <= 60 ? 5 : 0) +
    (team.progress < 60 ? 10 : 0) +
    team.risks.length * 5 +
    team.specialNotes.length * 3;
  return Math.min(score, 100);
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "Normal";
  if (score <= 60) return "Caution";
  if (score <= 80) return "Warning";
  return "Critical";
}

export function getRiskColor(level: RiskLevel): string {
  return { Normal: "#3fb950", Caution: "#58a6ff", Warning: "#d29922", Critical: "#f85149" }[level];
}

export function getDaysUntil(date: string, today: string): number {
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000);
}

export function sortTeamsByRisk(teams: Team[]): Team[] {
  return [...teams].sort(
    (a, b) =>
      calculateRiskScore(b) - calculateRiskScore(a) ||
      a.progress - b.progress ||
      a.checkinRate - b.checkinRate,
  );
}

export function getRecommendedActions(teams: Team[]): string[] {
  return sortTeamsByRisk(teams).slice(0, 3).map((team) => {
    const question = team.requiredQuestions[0] ?? "핵심 위험 대응 상태를 확인하세요.";
    return `${team.teamName} ${question}`;
  });
}
