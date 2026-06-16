import { project } from "./data/projectData";
import {
  DashboardHeader,
  DataSourceSummary,
  KpiCard,
  MilestoneTimeline,
  OperatorActions,
  RiskBreakdown,
  RiskRanking,
  ScrumHistory,
  TeamStatusTabs,
} from "./components/Dashboard";
import { calculateRiskScore, getDaysUntil, getRiskLevel } from "./utils/risk";
import { getTodayInTimeZone } from "./utils/date";
import { useDashboardData } from "./hooks/useDashboardData";

export default function App() {
  const {
    teams,
    dataUpdatedAt,
    checkinUpdatedThrough,
    sourceMode,
    isLoading,
    error,
    scrumEntries,
  } = useDashboardData();
  const today = getTodayInTimeZone();
  const scores = teams.map(calculateRiskScore);
  const riskTeams = scores.filter((score) => getRiskLevel(score) !== "Normal").length;
  const averageRisk = Math.round(scores.reduce((sum, score) => sum + score, 0) / teams.length);
  const averageCheckin = Math.round(teams.reduce((sum, team) => sum + team.checkinRate, 0) / teams.length);
  const healthIssues = teams.filter((team) => team.healthRisk).length;
  const upcoming = project.milestones.filter((item) => item.status === "upcoming");

  return (
    <main>
      <div className="app-shell">
        <DashboardHeader today={today} />
        <DataSourceSummary
          sources={project.dataSources}
          updatedAt={dataUpdatedAt}
          checkinUpdatedThrough={checkinUpdatedThrough}
          sourceMode={sourceMode}
          isLoading={isLoading}
          error={error}
        />
        <section className="kpi-grid">
          <KpiCard label="전체 팀" value={teams.length} hint="운영 대상 프로젝트 팀" />
          <KpiCard label="주의 이상 팀" value={riskTeams} hint="Caution 이상 우선 확인" tone="danger" />
          <KpiCard label="평균 위험 점수" value={averageRisk} hint="100점 기준" tone="warning" />
          <KpiCard label="최신 평균 체크인" value={`${averageCheckin}%`} hint="2026.06.12 제출 기준" tone="info" />
          <KpiCard label="컨디션 주의 팀" value={healthIssues} hint="개인정보 비식별 집계" tone="health" />
        </section>
        <section className="dday-grid">
          {upcoming.map((item) => (
            <div className="dday-card" key={item.name}>
              <span>{item.name}</span>
              <strong>D-{getDaysUntil(item.date, today)}</strong>
              <small>{item.date.replaceAll("-", ".")}</small>
            </div>
          ))}
        </section>
        <OperatorActions teams={teams} />
        <div className="two-column">
          <MilestoneTimeline milestones={project.milestones} today={today} />
          <RiskBreakdown teams={teams} />
        </div>
        <RiskRanking teams={teams} />
        <ScrumHistory entries={scrumEntries} teams={teams} />
        <TeamStatusTabs teams={teams} />
        <footer>PROJECT RISK CONTROL CENTER · 공개 버전은 개인 식별 및 민감정보를 표시하지 않습니다.</footer>
      </div>
    </main>
  );
}
