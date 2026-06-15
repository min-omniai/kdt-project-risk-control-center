# KDT Project Risk Control Center

KDT 게임 개발 과정 운영진이 8개 프로젝트 팀의 진척도, 체크인, 일정·기획·기술·협업 리스크를 빠르게 파악하기 위한 대시보드입니다.

## 데이터 기준

- `기업협약_통합_관리_시트(플밍)_2026`의 `공용` 탭
- `기업협약_데일리체크인_2026`의 `Day-1`, `Day-2`, `Day-3` 탭
- 현재 공개 페이지는 2026-06-15 분석 스냅샷입니다.
- 개인정보 보호를 위해 개인 이름과 건강·상담 세부 내용은 공개 데이터에서 제외했습니다.

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## GitHub Pages 배포

```bash
npm run deploy
```

빌드 결과가 `gh-pages` 브랜치에 배포됩니다.

## 관리자 로그인

로그인은 Supabase Auth의 이메일·비밀번호 인증을 사용합니다.

1. Supabase 프로젝트를 생성합니다.
2. `.env.example`을 참고해 로컬 `.env`에 URL과 Publishable Key를 설정합니다.
3. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
4. Authentication의 공개 이메일 회원가입을 비활성화합니다.
5. Supabase Dashboard에서 관리자 사용자를 직접 생성합니다.
6. 생성된 사용자 ID를 `admin_profiles`에 등록합니다.

```sql
insert into public.admin_profiles (user_id, display_name)
values ('AUTH_USER_UUID', '운영 관리자');
```

브라우저에는 Publishable Key만 사용합니다. Secret Key 또는 기존 `service_role` 키를 저장하면 안 됩니다.

현재 팀 데이터는 비식별 공개 스냅샷입니다. 개인 정보가 포함된 데이터를 보호하려면 `team_daily_status`로 이전한 뒤 로그인 후 조회하도록 변경해야 합니다.

기존 서비스가 공개 회원가입을 사용해 비활성화할 수 없는 경우에도, 대시보드는 `admin_profiles`에 등록된 사용자만 허용합니다.
