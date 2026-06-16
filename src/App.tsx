import { project } from "./data/projectData";
import {
  DashboardHeader,
  DataSourceSummary,
  HealthWatch,
  KpiCard,
  MilestoneTimeline,
  OperatorActions,
  RiskBreakdown,
  RiskRanking,
  ScrumHistory,
  TeamStatusTabs,
} from "./components/Dashboard";
import { calculateRiskScore, getDaysUntil, getRiskLevel, sortTeamsByRisk } from "./utils/risk";
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
  const rankedTeams = sortTeamsByRisk(teams);
  const topTeam = rankedTeams[0];
  const topTeamScore = topTeam ? calculateRiskScore(topTeam) : 0;
  const riskTeams = scores.filter((score) => getRiskLevel(score) !== "Normal").length;
  const averageRisk = Math.round(scores.reduce((sum, score) => sum + score, 0) / teams.length);
  const averageCheckin = Math.round(teams.reduce((sum, team) => sum + team.checkinRate, 0) / teams.length);
  const healthIssues = teams.filter((team) => team.healthRisk).length;
  const upcoming = project.milestones.filter((item) => item.status === "upcoming");
  const latestCheckinLabel = checkinUpdatedThrough.replaceAll("-", ".");

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
          <KpiCard
            label="오늘 1순위"
            value={topTeam?.teamName ?? "-"}
            hint={topTeam ? `${topTeam.company} · 위험 ${topTeamScore}점 · 총 ${teams.length}팀 중 최우선` : "분석 대기"}
            tone="danger"
          />
          <KpiCard label="주의 이상 팀" value={riskTeams} hint="Caution 이상 우선 확인" tone="danger" />
          <KpiCard label="평균 위험 점수" value={averageRisk} hint="100점 기준" tone="warning" />
          <KpiCard label="체크인 평균" value={`${averageCheckin}%`} hint={`${latestCheckinLabel} 기준`} tone="info" />
          <KpiCard label="컨디션 주의" value={healthIssues} hint="팀/학습자 상세 확인" tone="health" />
        </section>
        <OperatorActions teams={teams} />
        <RiskRanking teams={teams} />
        <div className="signal-grid">
          <HealthWatch entries={scrumEntries} teams={teams} />
          <section className="deadline-panel panel">
            <div className="deadline-heading">
              <h2>다가오는 마감</h2>
              <p>오늘 기준 남은 일정</p>
            </div>
            <div className="dday-grid">
              {upcoming.map((item) => (
                <div className="dday-card" key={item.name}>
                  <span>{item.name}</span>
                  <strong>D-{getDaysUntil(item.date, today)}</strong>
                  <small>{item.date.replaceAll("-", ".")}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="two-column">
          <MilestoneTimeline milestones={project.milestones} today={today} />
          <RiskBreakdown teams={teams} />
        </div>
        <ScrumHistory entries={scrumEntries} teams={teams} />
        <TeamStatusTabs teams={teams} />
        <footer>PROJECT RISK CONTROL CENTER · 공개 버전은 개인 식별 및 민감정보를 표시하지 않습니다.</footer>
      </div>
    </main>
  );
}
