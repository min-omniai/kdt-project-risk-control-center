import type { Milestone, Team } from "../types";

export const project = {
  name: "기업협약 프로젝트",
  today: "2026-06-15",
  dataUpdatedAt: "2026-06-15 16:06",
  checkinUpdatedThrough: "2026-06-12",
  dataSources: [
    "기업협약_통합_관리_시트(플밍)_2026 · 공용",
    "기업협약_데일리체크인_2026 · Day-1 / Day-2 / Day-3",
  ],
  milestones: [
    { name: "데모 제출", date: "2026-06-09", status: "completed" },
    { name: "CBT 1차 마감", date: "2026-06-23", status: "upcoming" },
    { name: "CBT 최종 마감", date: "2026-06-30", status: "upcoming" },
    { name: "프로젝트 배포", date: "2026-07-14", status: "upcoming" },
    { name: "발표회", date: "2026-07-16", status: "upcoming" },
  ] satisfies Milestone[],
};

const history = (day3: number, day2: number, day1: number) => [
  { date: "06.10", rate: day3 },
  { date: "06.11", rate: day2 },
  { date: "06.12", rate: day1 },
];

export const teams: Team[] = [
  {
    teamId: 1, company: "더브릭스", teamName: "1팀", progress: 68, checkinRate: 50,
    healthRisk: true, scheduleRisk: false, planningRisk: false, technicalRisk: false, collaborationRisk: false,
    status: "시즌 콘텐츠 개발 착수", goodPoints: ["기능 구현 목록 작성 완료 단계", "작업 홀딩 및 일정 지연 없음"],
    risks: ["핵심 인력 컨디션 변수", "낮은 최신 체크인 제출률"],
    specialNotes: ["건강 변수 발생 시 업무 재분배 필요"],
    requiredQuestions: ["기능 분배 후 차주 완료 목표가 확정되었는가?", "컨디션 이슈 발생 시 대체 담당자가 정해져 있는가?"],
    checkinHistory: history(50, 75, 50),
  },
  {
    teamId: 2, company: "더브릭스", teamName: "2팀", progress: 72, checkinRate: 60,
    healthRisk: false, scheduleRisk: false, planningRisk: false, technicalRisk: false, collaborationRisk: false,
    status: "안정적 진행", goodPoints: ["신규 콘텐츠 작업 진행", "현재 홀딩 이슈 없음"],
    risks: ["추가 기획 유입 가능성", "체크인 제출률 개선 필요"],
    specialNotes: ["사진 업로드 기능 관련 기술 검증 진행"],
    requiredQuestions: ["새 기획 포함 시 차주 완료 범위는 무엇인가?", "현재 진행 중인 기능 간 연결 구조가 검증되었는가?"],
    checkinHistory: history(20, 40, 60),
  },
  {
    teamId: 3, company: "더브릭스", teamName: "3팀", progress: 62, checkinRate: 40,
    healthRisk: true, scheduleRisk: true, planningRisk: false, technicalRisk: true, collaborationRisk: false,
    status: "마일스톤 1 복구 진행", goodPoints: ["알림 시스템 기능 검증 진행", "마일스톤 2 선행 작업 병행"],
    risks: ["마일스톤 1 일정 지연", "알림 시스템 통합 지연", "팀 컨디션 저하 신호"],
    specialNotes: ["작업 범위 전달과 보고 체계 보완 필요"],
    requiredQuestions: ["추가 빌드 후 마일스톤 2 착수가 가능한가?", "알림 시스템 통합 완료 예정일은 언제인가?"],
    checkinHistory: history(60, 80, 40),
  },
  {
    teamId: 4, company: "바삭한", teamName: "4팀", progress: 65, checkinRate: 75,
    healthRisk: false, scheduleRisk: true, planningRisk: false, technicalRisk: false, collaborationRisk: true,
    status: "인원 재편 후 일정 조정", goodPoints: ["필수 기능 중심으로 범위 축소", "인원 및 일정 재조정 완료"],
    risks: ["인원 이탈 이후 병목 가능성", "작업자 변경에 따른 인수인계 위험"],
    specialNotes: ["볼륨업 없이 필수 기능에 집중"],
    requiredQuestions: ["현재 인원으로 일정 유지가 가능한가?", "담당 변경 작업의 코드 리뷰와 인수인계가 끝났는가?"],
    checkinHistory: history(75, 75, 75),
  },
  {
    teamId: 5, company: "바삭한", teamName: "5팀", progress: 58, checkinRate: 60,
    healthRisk: false, scheduleRisk: true, planningRisk: false, technicalRisk: false, collaborationRisk: false,
    status: "MVP 핵심 시스템 구현 중", goodPoints: ["퀘스트·세이브·인사 시스템 병행", "UI와 데이터 연동 진행"],
    risks: ["MVP 필수 구현 범위가 넓음", "기능 간 통합 작업량 과다"],
    specialNotes: ["타이쿤 장르 특성상 핵심 루프 검증 우선"],
    requiredQuestions: ["현재 플레이 가능한 핵심 루프는 무엇인가?", "CBT 전 제거 가능한 기능이 구분되어 있는가?"],
    checkinHistory: history(60, 80, 60),
  },
  {
    teamId: 6, company: "유닉온", teamName: "6팀", progress: 70, checkinRate: 80,
    healthRisk: true, scheduleRisk: true, planningRisk: true, technicalRisk: true, collaborationRisk: false,
    status: "CBT 빌드 후 핵심 흐름 보완", goodPoints: ["게임 기본 틀과 CBT 빌드 확보", "유물 시스템 구현 진행"],
    risks: ["튜토리얼 예외 처리 부족", "내러티브 일정 산정 누락", "집중 개발에 따른 피로 신호"],
    specialNotes: ["CBT 필수 요소 우선순위 재확인 필요"],
    requiredQuestions: ["튜토리얼부터 엔딩까지 1판 완주 가능한가?", "CBT 필수 기능 완료율과 미완료 목록은 무엇인가?"],
    checkinHistory: history(60, 80, 80),
  },
  {
    teamId: 7, company: "유닉온", teamName: "7팀", progress: 75, checkinRate: 75,
    healthRisk: false, scheduleRisk: false, planningRisk: false, technicalRisk: false, collaborationRisk: false,
    status: "매우 안정적", goodPoints: ["데이터 연결 구조 안정화", "SO 기반 구조와 콘텐츠 확장 준비"],
    risks: [],
    specialNotes: ["일시적 인원 공백 영향 확인 필요"],
    requiredQuestions: ["데이터 연결 완료 후 콘텐츠 확장 일정이 확보됐는가?", "인원 공백으로 인한 병목은 없는가?"],
    checkinHistory: history(100, 100, 75),
  },
  {
    teamId: 8, company: "유닉온", teamName: "8팀", progress: 55, checkinRate: 60,
    healthRisk: true, scheduleRisk: true, planningRisk: true, technicalRisk: true, collaborationRisk: true,
    status: "기획 의존도 매우 높음", goodPoints: ["추가 기획 유입 차단", "핵심 시스템 개발 지속"],
    risks: ["필수 기획 자료 미확정", "팀장 소통 업무 과부하", "작업량·컨디션 주의 신호"],
    specialNotes: ["팀장 작업시간의 약 30%가 기획 협의에 사용됨"],
    requiredQuestions: ["미수령 필수 기획 목록과 전달 일정이 확정됐는가?", "특수 블록·튜토리얼·스킬 DB 기획이 모두 준비됐는가?"],
    checkinHistory: history(60, 60, 60),
  },
];
