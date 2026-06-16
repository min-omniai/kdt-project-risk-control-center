import { useState } from "react";
import type { Milestone, RiskKey, ScrumEntry, Team } from "../types";
import {
  calculateRiskScore,
  getDaysUntil,
  getRecommendedActions,
  getRiskColor,
  getRiskLevel,
  sortTeamsByRisk,
} from "../utils/risk";
import { getKoreanWeekday } from "../utils/date";

export function DashboardHeader({ today }: { today: string }) {
  const formatted = today.replaceAll("-", ". ");
  const weekday = getKoreanWeekday(today);
  return (
    <header className="dashboard-header">
      <div>
        <div className="eyebrow"><span className="live-dot" /> PROJECT CONTROL CENTER</div>
        <h1>오늘, 어떤 팀을 먼저 관리해야 할까요?</h1>
        <p>기업협약 프로젝트 · 위험 신호를 우선순위와 실행 항목으로 전환합니다.</p>
      </div>
      <div className="date-box"><span>기준일</span><strong>{formatted}</strong><small>{weekday}</small></div>
    </header>
  );
}

export function DataSourceSummary({
  sources,
  updatedAt,
  checkinUpdatedThrough,
  sourceMode,
  isLoading,
  error,
}: {
  sources: string[];
  updatedAt: string;
  checkinUpdatedThrough: string;
  sourceMode: "live" | "snapshot";
  isLoading: boolean;
  error: string;
}) {
  const syncLabel = isLoading
    ? "Supabase 최신 데이터 확인 중"
    : sourceMode === "live"
      ? "Google Sheets 자동 동기화"
      : "Google Sheets 분석 스냅샷";

  return (
    <section className={`source-summary ${error ? "source-warning" : ""}`}>
      <div><span className="source-status" /> {syncLabel}</div>
      <p>{sources.join(" + ")}</p>
      <small>{error || `동기화 ${updatedAt} · 체크인 ${checkinUpdatedThrough}까지 반영`}</small>
    </section>
  );
}

export function KpiCard({ label, value, hint, tone = "default" }: { label: string; value: string | number; hint: string; tone?: string }) {
  return <article className={`kpi-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}

const healthKeywords = ["건강", "컨디션", "복통", "허리", "수면", "피로", "병원", "조퇴", "지각", "멘탈", "과부하"];

function hasHealthSignal(text: string): boolean {
  return healthKeywords.some((keyword) => text.includes(keyword));
}

function healthQuestionFor(team: Team): string {
  return (
    team.requiredQuestions.find((question) => hasHealthSignal(question)) ||
    team.requiredQuestions[0] ||
    "오늘 작업량 조정이나 역할 재분배가 필요한가?"
  );
}

export function HealthWatch({ entries, teams }: { entries: ScrumEntry[]; teams: Team[] }) {
  const watchItems = teams
    .filter((team) => team.healthRisk)
    .map((team) => {
      const learnerSignals = entries
        .filter((entry) => entry.teamId === team.teamId)
        .filter((entry) => hasHealthSignal([entry.workload, entry.comment, entry.note, entry.status].join(" ")))
        .sort((a, b) => b.date.localeCompare(a.date));

      if (learnerSignals.length) {
        return learnerSignals.slice(0, 3).map((entry) => ({
          key: `${team.teamId}-${entry.learnerName}-${entry.date}`,
          company: team.company,
          teamName: team.teamName,
          learnerName: entry.learnerName,
          date: entry.date,
          signal: [entry.note, entry.comment, entry.status].filter(Boolean).join(" · ") || entry.workload,
          question: healthQuestionFor(team),
        }));
      }

      return [{
        key: `${team.teamId}-team`,
        company: team.company,
        teamName: team.teamName,
        learnerName: "팀 단위 확인",
        date: "최신 종합 피드백",
        signal: [...team.specialNotes, ...team.risks].find(hasHealthSignal) || team.status,
        question: healthQuestionFor(team),
      }];
    })
    .flat();

  return (
    <section className="panel health-watch-panel">
      <div className="health-watch-heading">
        <SectionTitle
          title="컨디션 주의 상세"
          subtitle="건강·피로·과부하 신호가 있는 팀과 학습자를 바로 확인합니다"
        />
        <span>{watchItems.length}건 확인</span>
      </div>
      {watchItems.length === 0 ? (
        <div className="health-empty">현재 컨디션 주의 신호가 등록된 팀은 없습니다.</div>
      ) : (
        <div className="health-watch-list">
          {watchItems.map((item) => (
            <article className="health-watch-item" key={item.key}>
              <div className="health-watch-top">
                <div>
                  <strong>{item.teamName}</strong>
                  <small>{item.company}</small>
                </div>
                <b>{item.learnerName}</b>
              </div>
              <p>{item.signal}</p>
              <div className="health-watch-bottom">
                <span>{item.date}</span>
                <em>{item.question}</em>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function RiskBadge({ score }: { score: number }) {
  const level = getRiskLevel(score);
  return <span className="risk-badge" style={{ color: getRiskColor(level), borderColor: `${getRiskColor(level)}66`, background: `${getRiskColor(level)}18` }}>{level}</span>;
}

export function ProgressBar({ value, kind = "progress" }: { value: number; kind?: "progress" | "checkin" }) {
  const color = value < 60 ? "#f85149" : value < 75 ? "#d29922" : kind === "checkin" ? "#58a6ff" : "#3fb950";
  return <div className="bar-track"><span style={{ width: `${value}%`, background: color }} /></div>;
}

export function MilestoneTimeline({ milestones, today }: { milestones: Milestone[]; today: string }) {
  return (
    <section className="panel timeline-panel">
      <SectionTitle title="마일스톤 타임라인" subtitle="현재 프로젝트의 주요 게이트와 남은 시간" />
      <div className="timeline">
        {milestones.map((item, index) => {
          const days = getDaysUntil(item.date, today);
          const isCurrent = index === 1;
          return (
            <div className={`milestone ${item.status} ${isCurrent ? "current" : ""}`} key={item.name}>
              <div className="milestone-top"><span className="milestone-dot">{item.status === "completed" ? "✓" : index + 1}</span><span className="timeline-line" /></div>
              <strong>{item.name}</strong><small>{item.date.replaceAll("-", ". ")}</small>
              <em>{days < 0 ? `D+${Math.abs(days)}` : days === 0 ? "D-DAY" : `D-${days}`}</em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function OperatorActions({ teams }: { teams: Team[] }) {
  const actions = getRecommendedActions(teams);
  return (
    <section className="panel action-panel">
      <div className="action-heading"><div><span className="eyebrow">TODAY'S FOCUS</span><h2>오늘의 운영자 액션</h2></div><span className="action-count">{actions.length}개 우선 확인</span></div>
      <ol>{actions.map((action, index) => <li key={action}><span>{String(index + 1).padStart(2, "0")}</span><p>{action}</p><b>확인 필요 →</b></li>)}</ol>
    </section>
  );
}

function getReasonSummary(team: Team): string {
  const flags = [
    team.planningRisk && "기획 미확정",
    team.scheduleRisk && "일정 지연",
    team.technicalRisk && "기술 리스크",
    team.healthRisk && "컨디션 이슈",
    team.collaborationRisk && "협업 이슈",
  ].filter(Boolean);
  return flags.length ? flags.join(" · ") : team.risks[0] ?? "특이 위험 없음";
}

export function RiskRanking({ teams }: { teams: Team[] }) {
  return (
    <section className="panel ranking-panel">
      <SectionTitle title="위험 우선순위" subtitle="시트 분석 위험 점수 내림차순 · 가장 먼저 개입할 팀" />
      <div className="ranking-head"><span>순위 / 팀</span><span>점수</span><span>핵심 사유</span><span>운영자 체크리스트</span></div>
      <div className="ranking-list">
        {sortTeamsByRisk(teams).map((team, index) => {
          const score = calculateRiskScore(team);
          return (
            <article className={`ranking-row ${index < 2 ? "priority" : ""}`} key={team.teamId}>
              <div className="rank-team"><b className="rank">{String(index + 1).padStart(2, "0")}</b><div><strong>{team.teamName}</strong><small>{team.company}</small></div></div>
              <div className="score"><strong style={{ color: getRiskColor(getRiskLevel(score)) }}>{score}</strong><RiskBadge score={score} /></div>
              <p className="reason">{getReasonSummary(team)}</p>
              <ul className="checklist">{team.requiredQuestions.slice(0, 2).map((q) => <li key={q}><span />{q}</li>)}</ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ScrumHistory({ entries, teams }: { entries: ScrumEntry[]; teams: Team[] }) {
  const [selectedTeamId, setSelectedTeamId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedTeam = teams.find((team) => team.teamId === selectedTeamId) ?? teams[0];
  const teamEntries = entries
    .filter((entry) => entry.teamId === selectedTeam?.teamId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const learnerNames = [...new Set(teamEntries.map((entry) => entry.learnerName))]
    .filter((name) => name.includes(searchTerm.trim()))
    .sort((a, b) => a.localeCompare(b, "ko"));

  return (
    <section className="panel scrum-history-panel">
      <SectionTitle
        title="데일리 스크럼 히스토리"
        subtitle="팀별 학습자 작업 기록을 날짜 내림차순으로 확인합니다"
      />
      <div className="scrum-toolbar">
        <div className="scrum-team-tabs" role="tablist" aria-label="스크럼 히스토리 팀 선택">
          {teams.map((team) => (
            <button
              aria-selected={selectedTeam?.teamId === team.teamId}
              className={selectedTeam?.teamId === team.teamId ? "active" : ""}
              key={team.teamId}
              onClick={() => setSelectedTeamId(team.teamId)}
              role="tab"
              type="button"
            >
              <span>{team.teamName}</span>
              <small>{team.company}</small>
            </button>
          ))}
        </div>
        <label className="scrum-search">
          <span>학습자 검색</span>
          <input
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="이름 입력"
            type="search"
            value={searchTerm}
          />
        </label>
      </div>

      {teamEntries.length === 0 ? (
        <div className="scrum-empty">
          아직 학습자별 스크럼 히스토리가 동기화되지 않았습니다. 최신 Apps Script의
          syncProjectRiskData를 한 번 실행하면 표시됩니다.
        </div>
      ) : learnerNames.length === 0 ? (
        <div className="scrum-empty">검색 조건에 맞는 학습자가 없습니다.</div>
      ) : (
        <div className="scrum-learner-grid">
          {learnerNames.map((learnerName) => {
            const learnerEntries = teamEntries.filter((entry) => entry.learnerName === learnerName);
            return (
              <article className="scrum-learner-card" key={learnerName}>
                <header>
                  <div>
                    <span>{selectedTeam?.company} · {selectedTeam?.teamName}</span>
                    <h3>{learnerName}</h3>
                  </div>
                  <strong>{learnerEntries.length}건</strong>
                </header>
                <div className="scrum-entry-list">
                  {learnerEntries.map((entry) => (
                    <div className="scrum-entry-item" key={`${entry.learnerName}-${entry.date}`}>
                      <div className="scrum-entry-head">
                        <b>{entry.date}</b>
                        <span className="scrum-progress-chip">
                          {entry.progress === null ? "진척 미기입" : `${entry.progress}%`}
                        </span>
                      </div>
                      <p>{entry.workload || "작업 내용 미기입"}</p>
                      {entry.comment && <small>{entry.comment}</small>}
                      {entry.note && <em>{entry.note}</em>}
                      <span className="scrum-status">{entry.status || "상태 미기입"}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const categories: { key: RiskKey; label: string }[] = [
  { key: "scheduleRisk", label: "일정" }, { key: "planningRisk", label: "기획" },
  { key: "technicalRisk", label: "기술" }, { key: "healthRisk", label: "컨디션" },
  { key: "collaborationRisk", label: "협업" },
];

export function RiskBreakdown({ teams }: { teams: Team[] }) {
  return (
    <section className="panel breakdown-panel">
      <SectionTitle title="리스크 카테고리" subtitle="유형별 영향 팀 현황" />
      <div className="category-list">{categories.map(({ key, label }) => {
        const affected = teams.filter((team) => team[key]);
        return <div className="category" key={key}><div><strong>{label} 리스크</strong><span>{affected.length}개 팀</span></div><ProgressBar value={(affected.length / teams.length) * 100} /><small>{affected.length ? affected.map((team) => team.teamName).join(", ") : "해당 없음"}</small></div>;
      })}</div>
    </section>
  );
}

export function TeamCard({ team }: { team: Team }) {
  const score = calculateRiskScore(team);
  return (
    <article className="team-card">
      <header><div><span>{team.company}</span><h3>{team.teamName}</h3></div><div className="team-score"><strong>{score}</strong><RiskBadge score={score} /></div></header>
      <div className="status-line"><span className="status-dot" style={{ background: getRiskColor(getRiskLevel(score)) }} />{team.status}</div>
      <div className="metric"><div><span>운영 추정 진척도</span><b>{team.progress}%</b></div><ProgressBar value={team.progress} /></div>
      <div className="metric"><div><span>최신 체크인</span><b>{team.checkinRate}%</b></div><ProgressBar value={team.checkinRate} kind="checkin" /></div>
      <div className="checkin-history">
        {team.checkinHistory.map((item) => (
          <div key={item.date}><span>{item.date}</span><b>{item.rate}%</b></div>
        ))}
      </div>
      <div className="team-details">
        <DetailBlock label="GOOD" items={team.goodPoints} className="good" />
        <DetailBlock label="RISK" items={team.risks.length ? team.risks : ["현재 등록된 위험 없음"]} className="risk" />
        {team.specialNotes.length > 0 && <DetailBlock label="NOTE" items={team.specialNotes} className="note" />}
      </div>
      <div className="questions"><strong>필수 확인 질문</strong>{team.requiredQuestions.map((q) => <p key={q}><span>?</span>{q}</p>)}</div>
    </article>
  );
}

const companies = ["더브릭스", "바삭한", "유닉온"] as const;

export function TeamStatusTabs({ teams }: { teams: Team[] }) {
  const [selectedCompany, setSelectedCompany] = useState<(typeof companies)[number]>("더브릭스");
  const visibleTeams = teams.filter((team) => team.company === selectedCompany);

  return (
    <section className="teams-section">
      <div className="team-section-heading">
        <SectionTitle
          title="팀 상세 현황"
          subtitle="브리핑·운영진 피드백·GPT 종합 피드백을 교차 분석한 기업별 팀 현황"
        />
        <div className="company-tabs" role="tablist" aria-label="기업별 팀 선택">
          {companies.map((company) => {
            const companyTeams = teams.filter((team) => team.company === company);
            const isSelected = selectedCompany === company;
            return (
              <button
                aria-controls={`company-panel-${company}`}
                aria-selected={isSelected}
                className={isSelected ? "active" : ""}
                key={company}
                onClick={() => setSelectedCompany(company)}
                role="tab"
                type="button"
              >
                <span>{company}</span>
                <b>{companyTeams.length}</b>
              </button>
            );
          })}
        </div>
      </div>
      <div
        aria-label={`${selectedCompany} 팀 상세 현황`}
        className={`team-grid company-team-grid team-count-${visibleTeams.length}`}
        id={`company-panel-${selectedCompany}`}
        role="tabpanel"
      >
        {visibleTeams.map((team) => <TeamCard team={team} key={team.teamId} />)}
      </div>
    </section>
  );
}

function DetailBlock({ label, items, className }: { label: string; items: string[]; className: string }) {
  return <div className={`detail-block ${className}`}><b>{label}</b><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="section-title"><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}
