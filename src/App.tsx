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
  const attentionTeams = rankedTeams.filter((team) => getRiskLevel(calculateRiskScore(team)) !== "Normal");
  const riskTeams = attentionTeams.length;
  const requiredQuestionCount = attentionTeams.reduce(
    (sum, team) => sum + Math.max(1, team.requiredQuestions.length),
    0,
  );
  const averageRisk = Math.round(scores.reduce((sum, score) => sum + score, 0) / teams.length);
  const highestRiskTeams = rankedTeams
    .filter((team) => calculateRiskScore(team) === topTeamScore)
    .map((team) => team.teamName)
    .join(", ");
  const attentionTeamNames = attentionTeams.map((team) => team.teamName).join(", ");
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
            detail={highestRiskTeams && highestRiskTeams !== topTeam?.teamName ? `동점: ${highestRiskTeams}` : "오늘 먼저 확인할 팀"}
            tone="danger"
          />
          <KpiCard label="질문 수" value={`${requiredQuestionCount}개`} hint="필수 확인 질문 전체" detail="3개씩 넘겨보기" tone="info" />
          <KpiCard label="주의팀 수" value={`${riskTeams}개`} hint="Caution 이상 팀" detail={attentionTeamNames || "해당 없음"} tone="warning" />
          <KpiCard label="CBT D-day" value={`D-${cbtDday}`} hint={cbtMilestone?.date.replaceAll("-", ".") ?? "일정 없음"} tone="info" />
          <KpiCard label="평균위험" value={averageRisk} hint={`${teams.length}개 팀 위험점수 평균`} detail={`최고 ${highestRiskTeams || "-"} ${topTeamScore}점`} tone="warning" />
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
