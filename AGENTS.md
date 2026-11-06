# Repository Guidelines

**생성일:** 2026-11-06  
**기준 커밋:** `e361ace`  
**브랜치:** `master`

## 개요

EyeKey 제품·교육 정보를 제공하는 단일 페이지 정적 사이트입니다. Vercel이 저장소 파일을 직접 제공하며, 별도 애플리케이션 프레임워크는 사용하지 않습니다.

## 프로젝트 구조

이 저장소는 별도 프레임워크나 빌드 도구가 없는 정적 Vercel 사이트입니다.

- `index.html`: 페이지 구조, 인라인 CSS, JavaScript, 해시 라우팅, 주문 폼, 캔버스 애니메이션을 모두 포함하는 진입점입니다.
- `img/product/`: 제품 사진, 케이스 이미지, 동영상과 포스터를 보관합니다.
- `img/certificate/`: 자격증 이미지와 PDF를 보관합니다.
- `downloads/`: 다운로드 파일을 보관합니다. 파일을 추가하면 `index.html`의 `CONFIG.files`에도 URL을 등록합니다.
- `vercel.json`, `robots.txt`, `sitemap.xml`: 배포 및 검색 엔진 설정입니다.

## 빌드·실행 명령

저장소에 정의된 빌드, 패키지, 린트 명령은 없습니다. Vercel에서는 Framework Preset을 `Other`로 두고 Build Command와 Output Directory를 비워 정적 파일을 그대로 배포합니다.

로컬 확인에는 다음 명령을 사용합니다.

```powershell
py -m http.server 8000 --directory .
```

브라우저에서 `http://localhost:8000`을 열어 확인합니다. 배포 권한과 Vercel CLI가 준비된 경우에만 `vercel --prod`를 사용합니다.

## Vercel 배포

### 서비스 링크 및 가입 상태

| 서비스 | 링크 | 가입·설정 필요 여부 | 현재 상태 |
|---|---|---|---|
| GitHub | [github.com](https://github.com/) | 저장소 관리와 Vercel 연동에 필요 | `origin`이 `https://github.com/jyuimp/eyekey-home.git`로 연결됨 |
| Vercel | [vercel.com/new](https://vercel.com/new) | 홈페이지 배포에 필요 | GitHub 연동 Project는 사용자 설정 기준으로 생성됨. 배포 상태는 Vercel Deployments에서 확인 |
| Supabase | [supabase.com/dashboard/sign-up](https://supabase.com/dashboard/sign-up) | 관리자 로그인·통계 저장에 필요 | `supabase-config.js`의 URL과 공개 키가 비어 있어 아직 프로젝트 연결 전 |

GitHub와 Vercel은 같은 계정으로 로그인해도 되지만 각각 서비스 가입과 권한 승인이 필요합니다. Supabase는 별도 계정과 프로젝트가 필요하며, 현재 구현은 Supabase 프로젝트를 생성하고 설정 값을 입력해야 활성화됩니다.

### GitHub 연동 배포

1. Vercel에서 `Create New` → `Project`를 선택합니다.
2. `Import Git Repository`에서 GitHub를 선택하고 권한을 승인합니다.
3. 저장소 목록에서 `EyeKey_Homepage`를 선택합니다.
4. Project Name과 연결할 GitHub 저장소를 확인합니다.
5. Framework Preset을 `Other`로 선택합니다.
6. Build Command는 비워 두고, Output Directory도 비워 둡니다. 이 프로젝트는 `index.html`을 그대로 제공합니다.
7. Root Directory가 저장소 루트(`./`)인지 확인합니다.
8. `Deploy`를 눌러 첫 배포를 실행합니다.
9. 배포가 끝나면 Vercel이 제공한 도메인에서 홈페이지를 엽니다.
10. 이후 연결된 브랜치, 기본값은 `master`, 에 push하면 Vercel이 자동으로 Preview 또는 Production 배포를 생성합니다.

Vercel의 Project Settings → Git에서 Production Branch가 `master`인지 확인합니다. `master`가 아닌 브랜치에서 작업하면 Preview 배포가 생성되므로, Preview URL에서 먼저 확인한 뒤 Production 브랜치에 merge합니다.

### CLI 배포

프로젝트 루트에서 다음 명령을 실행합니다.

```powershell
vercel login
vercel --prod
```

`vercel.json`의 `cleanUrls: true` 설정이 적용되며, 이 프로젝트는 별도 빌드 없이 정적 파일을 그대로 배포합니다.
Supabase를 연결한 경우 배포 전에 `supabase-config.js`의 공개 URL과 publishable/anon key가 설정되어 있어야 합니다. `service_role` 키나 비밀번호는 커밋하거나 정적 파일에 넣지 않습니다.

### Supabase 연동 설정

1. Supabase에서 새 프로젝트를 만들고 데이터베이스가 준비될 때까지 기다립니다.
2. Supabase Dashboard → Authentication → Providers에서 Email 로그인을 활성화합니다.
3. Supabase Dashboard → SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다. `admin_users`와 `analytics_events` 테이블, 관리자 조회용 RLS 정책이 생성됩니다.
4. Authentication → Users → Add user에서 관리자 이메일과 비밀번호를 생성합니다. 실제 운영 관리자 계정만 등록합니다.
5. 생성된 사용자의 UUID를 복사하고 SQL Editor에서 다음을 실행합니다.

   ```sql
   insert into public.admin_users (user_id)
   values ('AUTH_USER_UUID');
   ```

   여기서 `user_id`는 `public.admin_users` 테이블의 컬럼이며, `AUTH_USER_UUID`는 직접 정하는 값이 아닙니다.
   Supabase Dashboard의 **Authentication → Users**에서 생성한 관리자 사용자의 **User UID(UUID)** 를 복사해 넣습니다. 예를 들어 다음과 같이 실행합니다.

   ```sql
   insert into public.admin_users (user_id)
   values ('12345678-abcd-4321-9876-123456789abc');
   ```

   `public.admin_users.user_id`는 `auth.users.id`를 참조하므로, 반드시 먼저 Authentication → Users에서 관리자 사용자를 생성해야 합니다.

6. Supabase Dashboard → Project Settings → API 또는 Connect에서 Project URL과 공개 publishable/anon key를 복사합니다.
7. 저장소의 `supabase-config.js`에 다음처럼 입력합니다. 이 키는 브라우저에 노출되는 공개 키만 사용합니다.

   ```js
   window.EYEKEY_SUPABASE_CONFIG = {
     url: 'https://YOUR_PROJECT.supabase.co',
     publishableKey: 'YOUR_PUBLIC_KEY'
   };
   ```

8. 변경 사항을 GitHub의 Preview 브랜치에 push하고 `/admin.html`에서 로그인합니다. 설정 안내 화면이 나오면 URL 또는 공개 키가 비어 있거나 파일이 배포되지 않은 것입니다.
9. 홈페이지를 방문하고 메뉴·버튼을 클릭한 뒤 Supabase Table Editor → `analytics_events`에서 `page_view`, `click` 행이 생성되는지 확인합니다.
10. 확인이 끝나면 Production 브랜치에 merge합니다. `service_role` 키, 관리자 비밀번호, JWT secret은 `index.html`, `admin.js`, `supabase-config.js` 또는 Vercel 정적 파일에 절대 넣지 않습니다.

### 배포 후 점검

1. Vercel이 제공한 Production URL에서 `/`, `/admin.html`, `/supabase-config.js`를 각각 엽니다. 세 주소가 모두 정상 응답해야 합니다.
2. 홈페이지에서 이미지·동영상과 해시 경로(`#home`, `#buy`, `#resources`, `#learn`)를 확인합니다. 개발자 도구 Network에 이미지·동영상 404가 없어야 합니다.
3. `/admin.html`에서 관리자 이메일과 비밀번호로 로그인합니다. 설정 화면이 보이면 `supabase-config.js`의 URL·publishable/anon key가 비어 있는 것입니다.
4. 로그인 후 최근 기간을 선택하고 방문자, 페이지 조회, 상호작용 수치와 이벤트 목록이 표시되는지 확인합니다. 권한 오류가 나면 Supabase의 `admin_users` UUID와 RLS 정책을 확인합니다.
5. 홈페이지를 새로 방문하거나 메뉴를 클릭한 뒤 Supabase Table Editor의 `analytics_events`에서 `page_view`와 `click` 행이 생성되는지 확인합니다.
6. Vercel Deployments의 배포 로그와 브라우저 Console에서 404, 외부 모듈 오류, Supabase CORS·권한 오류를 확인합니다. Preview URL에서도 같은 점검을 먼저 수행한 뒤 Production으로 승격합니다.

## 코딩 스타일 및 명명

HTML, CSS, JavaScript는 현재 `index.html`의 기존 형식과 이름을 따릅니다. CSS 클래스는 소문자 kebab-case를 사용하고, JavaScript 설정은 `CONFIG`처럼 대문자 상수로 유지합니다. 사용자에게 보이는 한국어 문구와 접근성용 `alt` 텍스트를 함께 수정하며, 이미지·동영상 경로는 저장소 기준 상대 경로를 사용합니다.

## 테스트 지침

자동화된 테스트나 커버리지 설정은 없습니다. 변경 후 로컬 서버에서 `#home`, `#buy`, `#resources`, `#learn` 경로와 주문 폼, 다운로드 링크, 이미지·동영상, 자격증 라이트박스를 직접 확인합니다. 새 파일은 실제 URL과 대소문자가 일치하는지도 확인합니다.

## 커밋 및 풀 리퀘스트

최근 Git 이력은 한국어로 변경 내용을 설명하는 짧은 제목을 사용하며 Conventional Commits 형식은 확인되지 않습니다. 예: `index.html에 수정하다가 누락된 부분이 있어 다시`. 커밋 시 변경 목적을 짧고 구체적인 동사형 제목으로 작성합니다. 풀 리퀘스트에는 변경 요약, 수동 확인 항목, 배포 영향, UI 변경 전후 스크린샷을 포함합니다.

## 설정 및 보안

가격·판매자 정보·다운로드 목록은 `index.html`의 `CONFIG.price`, `CONFIG.holder`, `CONFIG.files`에서 관리합니다. 실제 연락처나 판매 정보 변경 시 링크와 화면의 중복 표시를 함께 점검하고, 비밀키·개인 인증정보는 정적 파일에 넣지 않습니다.
