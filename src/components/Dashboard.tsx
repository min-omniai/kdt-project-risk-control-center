import { useState } from "react";
import type { Milestone, RiskKey, ScrumEntry, Team } from "../types";
import {
  calculateRiskScore,
  getDaysUntil,
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
        <div className="eyebrow"><span className="live-dot" /> OPERATIONS CONTROL</div>
        <h1>운영진 팀 관리 센터</h1>
        <p>오늘 개입할 팀, 확인 질문, 후속 조치를 30초 안에 정리합니다.</p>
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
    ? "최신 데이터 확인 중"
    : sourceMode === "live"
      ? "Sheets 동기화 완료"
      : "기본 스냅샷 표시";

  return (
    <section className={`source-summary ${error ? "source-warning" : ""}`}>
      <div><span className="source-status" /> {syncLabel}</div>
      <p>{sources.join(" + ")}</p>
      <small>{error || `동기화 ${updatedAt} · 체크인 ${checkinUpdatedThrough}까지`}</small>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: string;
}) {
  return <article className={`kpi-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}

const healthKeywords = ["건강", "컨디션", "복통", "허리", "수면", "피로", "병원", "조퇴", "지각", "멘탈", "과부하"];

function hasHealthSignal(text: string): boolean {
  return healthKeywords.some((keyword) => text.includes(keyword));
}

function getPrimaryQuestion(team: Team): string {
  return team.requiredQuestions[0] || "오늘 막힌 작업과 다음 마감 기준을 확인했는가?";
}

function getPrimaryRisk(team: Team): string {
  return team.risks[0] || getReasonSummary(team);
}

function getJudgmentCriteria(team: Team): string {
  if (team.planningRisk) return "CBT 필수 범위가 오늘 안에 잠기면 진행, 아니면 범위 축소";
  if (team.scheduleRisk) return "다음 마일스톤까지 복구 일정과 담당자가 명확하면 진행";
  if (team.technicalRisk) return "플레이 가능한 빌드에서 핵심 루프가 검증되면 진행";
  if (team.healthRisk) return "작업량 조정 후 핵심 담당 공백이 없으면 진행";
  if (team.checkinRate <= 60) return "미응답자가 확인되고 오늘 작업 로그가 채워지면 진행";
  return "오늘 완료 기준과 담당자가 명확하면 진행";
}

function getOperatorAction(team: Team): string {
  if (team.planningRisk) return "기획 확정 회의 15분, 결정사항 문서화";
  if (team.scheduleRisk) return "마감 복구표 작성 후 담당자 재배치";
  if (team.technicalRisk) return "빌드/핵심 루프 시연으로 병목 확인";
  if (team.healthRisk) return "컨디션 확인 후 업무량 조정";
  if (team.collaborationRisk) return "담당 경계와 인수인계 항목 정리";
  if (team.checkinRate <= 60) return "미체크 인원에게 오늘 작업 로그 요청";
  return "현재 계획 유지, 다음 체크인만 확인";
}

function getOperatorActionItems(teams: Team[]) {
  return sortTeamsByRisk(teams).slice(0, 3).map((team) => ({
    team,
    question: getPrimaryQuestion(team),
    criteria: getJudgmentCriteria(team),
    action: getOperatorAction(team),
  }));
}

function getHealthWatchItems(entries: ScrumEntry[], teams: Team[]) {
  return teams
    .filter((team) => team.healthRisk)
    .map((team) => {
      const learnerSignals = entries
        .filter((entry) => entry.teamId === team.teamId)
        .filter((entry) => hasHealthSignal([entry.workload, entry.comment, entry.note, entry.status].join(" ")))
        .sort((a, b) => b.date.localeCompare(a.date));

      return {
        team,
        learnerSignals,
        summary: [...team.specialNotes, ...team.risks].find(hasHealthSignal) || team.status,
      };
    });
}

export function HealthWatch({ entries, teams }: { entries: ScrumEntry[]; teams: Team[] }) {
  const watchItems = getHealthWatchItems(entries, teams);

  return (
    <section className="health-compact">
      <div className="health-compact-summary">
        <strong>컨디션 주의</strong>
        <span>{watchItems.length}팀</span>
        <small>{watchItems.map((item) => item.team.teamName).join(", ") || "해당 없음"}</small>
      </div>
      {watchItems.length > 0 && (
        <details className="health-detail">
          <summary>개인 상세 보기</summary>
          <div className="health-detail-list">
            {watchItems.map(({ team, learnerSignals, summary }) => (
              <article key={team.teamId}>
                <b>{team.teamName}</b>
                {learnerSignals.length ? (
                  learnerSignals.slice(0, 3).map((entry) => (
                    <p key={`${entry.learnerName}-${entry.date}`}>
                      <span>{entry.learnerName}</span>
                      {entry.date} · {[entry.note, entry.comment, entry.status].filter(Boolean).join(" · ") || entry.workload}
                    </p>
                  ))
                ) : (
                  <p><span>팀 단위</span>{summary}</p>
                )}
              </article>
            ))}
          </div>
        </details>
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
  const upcoming = milestones.filter((item) => item.status === "upcoming");

  return (
    <section className="panel timeline-panel">
      <SectionTitle title="마일스톤" subtitle="다가오는 마감과 전체 일정" />
      <div className="dday-grid milestone-dday-grid">
        {upcoming.map((item) => (
          <div className="dday-card" key={item.name}>
            <span>{item.name}</span>
            <strong>{formatDday(getDaysUntil(item.date, today))}</strong>
            <small>{item.date.replaceAll("-", ".")}</small>
          </div>
        ))}
      </div>
      <div className="timeline">
        {milestones.map((item, index) => {
          const days = getDaysUntil(item.date, today);
          const isCurrent = item.status !== "completed" && index === milestones.findIndex((milestone) => milestone.status !== "completed");
          return (
            <div className={`milestone ${item.status} ${isCurrent ? "current" : ""}`} key={item.name}>
              <div className="milestone-top"><span className="milestone-dot">{item.status === "completed" ? "✓" : index + 1}</span><span className="timeline-line" /></div>
              <strong>{item.name}</strong><small>{item.date.replaceAll("-", ". ")}</small>
              <em>{formatDday(days)}</em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatDday(days: number): string {
  if (days < 0) return `D+${Math.abs(days)}`;
  if (days === 0) return "D-DAY";
  return `D-${days}`;
}

export function OperatorActions({ teams }: { teams: Team[] }) {
  const actions = getOperatorActionItems(teams);
  return (
    <section className="panel action-panel">
      <div className="action-heading">
        <div><span className="eyebrow">TODAY'S FOCUS</span><h2>오늘 확인할 질문 TOP3</h2></div>
        <span className="action-count">질문 → 판단 기준 → 후속 조치</span>
      </div>
      <ol>
        {actions.map((item, index) => (
          <li key={`${item.team.teamId}-${item.question}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{item.team.teamName}: {item.question}</strong>
              <p><b>판단 기준</b>{item.criteria}</p>
              <p><b>후속 조치</b>{item.action}</p>
            </div>
          </li>
        ))}
      </ol>
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
  return flags.length ? flags.join(" · ") : team.risks[0] ?? "현재 주요 위험 없음";
}

export function RiskRanking({ teams }: { teams: Team[] }) {
  return (
    <section className="panel ranking-panel">
      <SectionTitle title="위험 우선순위" subtitle="팀 / 점수 / 핵심 리스크 / 확인 질문 / 액션" />
      <div className="ranking-head"><span>팀</span><span>위험</span><span>핵심 리스크</span><span>확인 질문 / 액션</span></div>
      <div className="ranking-list">
        {sortTeamsByRisk(teams).map((team, index) => {
          const score = calculateRiskScore(team);
          return (
            <article className={`ranking-row ${index < 2 ? "priority" : ""}`} key={team.teamId}>
              <div className="rank-team"><b className="rank">{String(index + 1).padStart(2, "0")}</b><div><strong>{team.teamName}</strong><small>{team.company}</small></div></div>
              <div className="score"><strong style={{ color: getRiskColor(getRiskLevel(score)) }}>{score}</strong><RiskBadge score={score} /></div>
              <p className="reason">{getReasonSummary(team)}</p>
              <ul className="checklist">
                <li><span />{getPrimaryQuestion(team)}</li>
                <li><span />{getOperatorAction(team)}</li>
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ScrumHistory({ entries, teams }: { entries: ScrumEntry[]; teams: Team[] }) {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.teamId ?? 1);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedTeam = teams.find((team) => team.teamId === selectedTeamId) ?? teams[0];
  const teamEntries = entries
    .filter((entry) => entry.teamId === selectedTeam?.teamId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const learnerNames = [...new Set(teamEntries.map((entry) => entry.learnerName))]
    .filter((name) => name.includes(searchTerm.trim()))
    .sort((a, b) => a.localeCompare(b, "ko"));

  return (
    <section className="scrum-history-panel">
      <SectionTitle
        title="최근 3일 스크럼 히스토리"
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
          아직 학습자별 스크럼 히스토리가 동기화되지 않았습니다. 최신 Apps Script의 syncProjectRiskData를 한 번 실행하면 표시됩니다.
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
  { key: "scheduleRisk", label: "일정" },
  { key: "planningRisk", label: "기획" },
  { key: "technicalRisk", label: "기술" },
  { key: "healthRisk", label: "컨디션" },
  { key: "collaborationRisk", label: "협업" },
];

export function RiskBreakdown({ teams }: { teams: Team[] }) {
  return (
    <section className="panel breakdown-panel">
      <SectionTitle title="리스크 유형" subtitle="일정/기획/기술/컨디션/협업 신호" />
      <div className="category-list">{categories.map(({ key, label }) => {
        const affected = teams.filter((team) => team[key]);
        return <div className="category" key={key}><div><strong>{label}</strong><span>{affected.length}팀</span></div><ProgressBar value={(affected.length / teams.length) * 100} /><small>{affected.length ? affected.map((team) => team.teamName).join(", ") : "해당 없음"}</small></div>;
      })}</div>
    </section>
  );
}

export function TeamCard({ team }: { team: Team }) {
  const score = calculateRiskScore(team);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="team-card compact-team-card">
      <header>
        <div><span>{team.company}</span><h3>{team.teamName}</h3></div>
        <div className="team-score"><strong>{score}</strong><RiskBadge score={score} /></div>
      </header>
      <div className="team-card-lines">
        <p><b>상태</b><span>{team.status}</span></p>
        <p><b>핵심 리스크</b><span>{getPrimaryRisk(team)}</span></p>
        <p><b>오늘 질문</b><span>{getPrimaryQuestion(team)}</span></p>
        <p><b>운영 액션</b><span>{getOperatorAction(team)}</span></p>
        <p><b>상세 보기</b><button type="button" onClick={() => setIsOpen((value) => !value)}>{isOpen ? "접기" : "열기"}</button></p>
      </div>
      {isOpen && (
        <div className="team-card-detail">
          <div className="metric"><div><span>운영 추정 진척도</span><b>{team.progress}%</b></div><ProgressBar value={team.progress} /></div>
          <div className="metric"><div><span>최신 체크인</span><b>{team.checkinRate}%</b></div><ProgressBar value={team.checkinRate} kind="checkin" /></div>
          <div className="team-details">
            <DetailBlock label="GOOD" items={team.goodPoints} className="good" />
            <DetailBlock label="RISK" items={team.risks.length ? team.risks : ["현재 등록된 위험 없음"]} className="risk" />
            {team.specialNotes.length > 0 && <DetailBlock label="NOTE" items={team.specialNotes} className="note" />}
          </div>
        </div>
      )}
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
          subtitle="상태 / 핵심 리스크 / 오늘 질문 / 운영 액션 / 상세 보기"
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

export function DetailLogs({ entries, teams }: { entries: ScrumEntry[]; teams: Team[] }) {
  return (
    <section className="panel detail-logs-panel">
      <SectionTitle title="상세 로그" subtitle="컨디션 / 최근 3일 스크럼 / 학습자별 기록" />
      <HealthWatch entries={entries} teams={teams} />
      <ScrumHistory entries={entries} teams={teams} />
    </section>
  );
}

function DetailBlock({ label, items, className }: { label: string; items: string[]; className: string }) {
  return <div className={`detail-block ${className}`}><b>{label}</b><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="section-title"><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}
