import type { Milestone, Team } from "../types";

export const project = {
  name: "기업협약 프로젝트",
  today: "2026-06-16",
  dataUpdatedAt: "2026-06-16 16:00",
  checkinUpdatedThrough: "2026-06-16",
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
  { date: "06.12", rate: day3 },
  { date: "06.15", rate: day2 },
  { date: "06.16", rate: day1 },
];

export const teams: Team[] = [
  {
    teamId: 1, company: "더브릭스", teamName: "1팀", progress: 68, checkinRate: 50,
    healthRisk: true, scheduleRisk: false, planningRisk: false, technicalRisk: false, collaborationRisk: false,
    status: "수요일 로직 완성 후 목~금 통합 예정", goodPoints: ["주간 목표가 수요일 로직 완성 → 목~금 통합으로 명확함", "송근형·신하용 작업 투입 계획 존재"],
    risks: ["이인 허리 통증과 낮은 체크인으로 대체 투입 기준 필요", "신하용·송근형이 연계 코드와 팀장 의존도를 어려움으로 보고"],
    specialNotes: ["허리 통증은 현재 작업 지장 없음이나 경과 모니터링 필요"],
    requiredQuestions: ["수요일 기준 로직 완성률은 몇 %이고, 목~금 통합에 들어갈 미배정 작업 담당자는 정해졌는가?", "이인님 허리 통증이 오늘 작업에 영향 있는지, 공백 시 대체 투입 기준은 정했는가?"],
    checkinHistory: history(75, 75, 75),
  },
  {
    teamId: 2, company: "더브릭스", teamName: "2팀", progress: 72, checkinRate: 60,
    healthRisk: false, scheduleRisk: true, planningRisk: false, technicalRisk: true, collaborationRisk: true,
    status: "미니게임 4종 70% 목표 · 프레임워크 적응 병목", goodPoints: ["냥냥 스냅 이후 냥아쿠아리움 순차 진행 계획", "추가 기획 유입 지양 요청 완료"],
    risks: ["이수형 프레임워크 이해 편차로 팀원 구현 방식이 흔들림", "Firestore/Storage/SO 연동 이슈가 냥냥 스냅 플레이 가능성에 영향"],
    specialNotes: ["가이드 배포만으로 부족해 페어 작업과 병목 파악 필요"],
    requiredQuestions: ["냥냥 스냅은 수~목 기준 실제 플레이 가능한 상태로 시연 가능한가?", "이수형님 프레임워크를 팀원이 잘못 이해한 지점과 오늘 같이 고칠 페어 작업은 무엇인가?"],
    checkinHistory: history(60, 100, 60),
  },
  {
    teamId: 3, company: "더브릭스", teamName: "3팀", progress: 62, checkinRate: 40,
    healthRisk: true, scheduleRisk: true, planningRisk: false, technicalRisk: true, collaborationRisk: false,
    status: "1차 마일스톤 완료 단계 · 2차 요구 기능 이월 가능", goodPoints: ["1차 범위는 빌드 추출만 남은 상태", "2차 마일스톤 선행 작업 착수 준비"],
    risks: ["23일 기준 이번 주 완료 범위 재산정 필요", "캡처 시스템 등 2차 기능 공수가 예상보다 커질 수 있음"],
    specialNotes: ["기획팀 요구 기능 일부는 다음 주 이월 예상"],
    requiredQuestions: ["23일 기준 이번 주 안에 완료할 기능과 다음 주로 이월할 기능을 목록으로 확정했는가?", "캡처·홈피트·DM·시즌 이벤트 중 오늘 병목이 가장 큰 기능은 무엇인가?"],
    checkinHistory: history(40, 80, 80),
  },
  {
    teamId: 4, company: "바삭한", teamName: "4팀", progress: 65, checkinRate: 75,
    healthRisk: true, scheduleRisk: true, planningRisk: true, technicalRisk: false, collaborationRisk: false,
    status: "필수 플레이 루프 70% 구현 · 출시용 에셋 적용 전환", goodPoints: ["CBT 범위 축소와 우선순위 낮은 단계 제외 완료", "필수 플레이 루프 구현에 집중"],
    risks: ["미확정 UI 기획 일정이 프로젝트 시작 UI·프로세스 작업에 영향", "구글 스토어 심사와 출시 검증으로 팀장 개발/관리 부하 증가"],
    specialNotes: ["김동현 감기 기운, 채병희 압박감 보고"],
    requiredQuestions: ["내일 기준 필수 플레이 루프 70% 완성 여부를 실제 화면으로 시연 가능한가?", "미확정 UI 중 임시 제작으로 진행할 항목과 기획팀 확정이 필요한 항목을 분리했는가?"],
    checkinHistory: history(75, 50, 50),
  },
  {
    teamId: 5, company: "바삭한", teamName: "5팀", progress: 58, checkinRate: 60,
    healthRisk: false, scheduleRisk: true, planningRisk: true, technicalRisk: true, collaborationRisk: false,
    status: "전체 로직 60% · 퀘스트/대화 시스템 집중", goodPoints: ["기획 미확정 파트도 임시 버튼으로 테스트 지속", "직원 고용·증축·이벤트 퀘스트·UI 리팩토링 병행"],
    risks: ["기획 확정 일정이 작업 일정에 아직 완전히 반영되지 않음", "퀘스트 씬 연출 추가 사항은 후순위로 통제 필요"],
    specialNotes: ["기획 PM에게 카테고리별 확정 일정 확인 필요"],
    requiredQuestions: ["오늘 점심 중 산정한 기획 확정 일정이 퀘스트·대화 시스템 작업 일정에 반영됐는가?", "임시 버튼/더미 데이터로 검증 가능한 퀘스트 흐름과 기획 확정 전 대기해야 하는 흐름을 분리했는가?"],
    checkinHistory: history(60, 80, 60),
  },
  {
    teamId: 6, company: "유닉온", teamName: "6팀", progress: 70, checkinRate: 80,
    healthRisk: true, scheduleRisk: false, planningRisk: true, technicalRisk: true, collaborationRisk: false,
    status: "QA·폴리싱 전환 · R&D 후순위 조정", goodPoints: ["CBT 빌드 확보 후 QA/폴리싱 집중 가능", "구글 로그인 등 R&D 후순위 이월 합의"],
    risks: ["소팅 규칙이 횟수 제한/시간 제한 중 최종 결정 대기", "몬스터 스킬·플레이어 움직임·소트 매니저 버그 원인 추적 필요"],
    specialNotes: ["지난주 번아웃 신호 이후 체력 관리 필요"],
    requiredQuestions: ["소팅 규칙은 횟수 제한과 시간 제한 중 오늘 어떤 기준으로 최종 확정할 것인가?", "오늘 QA에서 반드시 닫아야 하는 버그 3개와 담당자는 정해졌는가?"],
    checkinHistory: history(80, 60, 60),
  },
  {
    teamId: 7, company: "유닉온", teamName: "7팀", progress: 75, checkinRate: 75,
    healthRisk: false, scheduleRisk: false, planningRisk: false, technicalRisk: false, collaborationRisk: false,
    status: "기능 골격 구현 안정 · 다음 주 폴리싱 준비", goodPoints: ["기물 스폰 우선순위와 SO 데이터 연결 구조 구현", "추가 기획 없이 기존 디테일·데이터 정제에 집중"],
    risks: ["전체 기능 골격이 실제 플레이 흐름으로 연결되는지 검증 전", "덱 편성·포탑/투사체 구현 간 인터페이스 연동 확인 필요"],
    specialNotes: ["18일 진행 상황 점검 예정"],
    requiredQuestions: ["18일 기준 전체 기능 골격이 하나의 플레이 흐름으로 연결되어 동작하는가?", "덱 편성, 기물 스폰, 포탑/투사체 구현 사이에 팀원 간 인수인계가 필요한 인터페이스는 무엇인가?"],
    checkinHistory: history(75, 67, 100),
  },
  {
    teamId: 8, company: "유닉온", teamName: "8팀", progress: 55, checkinRate: 60,
    healthRisk: true, scheduleRisk: true, planningRisk: true, technicalRisk: true, collaborationRisk: true,
    status: "수요일 병합 예정 · 하우징 DB 지연으로 범위 불확실", goodPoints: ["스킬·인챈트만으로 CBT 핵심 동작은 가능", "하우징은 CBT 우선순위 낮음으로 분리 판단"],
    risks: ["하우징 DB 기획 10일 이상 지연과 수정 발생으로 조규민 작업 정체 우려", "수요일 병합 후 금요일 테스트 가능한 기능 범위가 아직 불명확"],
    specialNotes: ["홍정옥 휴가/몸살, 김영찬 우선순위 밀림·멘탈 신호"],
    requiredQuestions: ["수요일 병합 후 금요일 테스트 가능한 기능과 제외할 기능 목록을 DM으로 공유했는가?", "하우징 DB가 오늘도 확정되지 않을 경우 조규민님이 더미 데이터로 진행할 대체 작업은 정했는가?"],
    checkinHistory: history(60, 60, 60),
  },
];
