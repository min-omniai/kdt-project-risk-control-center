import { project } from "./data/projectData";
import {
  DashboardHeader,
  DataSourceSummary,
  DetailLogs,
  KpiCard,
  MilestoneTimeline,
  OperatorActions,
  RiskBreakdown,
  RiskRanking,
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
  const cbtMilestone = project.milestones.find((item) => item.name.includes("CBT 1"));
  const cbtDday = cbtMilestone ? getDaysUntil(cbtMilestone.date, today) : 0;

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
            label="최우선팀"
            value={topTeam?.teamName ?? "-"}
            hint={topTeam ? `${topTeam.company} · 위험 ${topTeamScore}점` : "분석 대기"}
            tone="danger"
          />
          <KpiCard label="질문 수" value="3개" hint="오늘 확인할 TOP3" tone="info" />
          <KpiCard label="주의팀 수" value={`${riskTeams}팀`} hint="Caution 이상" tone="warning" />
          <KpiCard label="CBT D-day" value={`D-${cbtDday}`} hint={cbtMilestone?.date.replaceAll("-", ".") ?? "일정 없음"} tone="info" />
          <KpiCard label="평균위험" value={averageRisk} hint="100점 기준" tone="warning" />
        </section>

        <OperatorActions teams={teams} />
        <RiskRanking teams={teams} />
        <TeamStatusTabs teams={teams} />

        <div className="two-column">
          <RiskBreakdown teams={teams} />
          <MilestoneTimeline milestones={project.milestones} today={today} />
        </div>

        <DetailLogs entries={scrumEntries} teams={teams} />
        <footer>PROJECT RISK CONTROL CENTER · 공개 버전은 개인 식별 및 민감정보를 표시하지 않습니다.</footer>
      </div>
    </main>
  );
}
