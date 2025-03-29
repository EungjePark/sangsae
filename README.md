# DetailCraft (상세-세공)

DetailCraft는 AI(Google Gemini)를 활용하여 이커머스 상세페이지를 빠르고 쉽게 생성할 수 있는 웹 애플리케이션입니다. 사용자가 상품 정보(상품명, 카테고리, 설명 등)를 입력하면 AI가 자동으로 전문적인 상세페이지를 생성해 주며, 생성된 콘텐츠는 편집, 재생성, 복사, PDF 다운로드 등 다양한 방식으로 활용할 수 있습니다.

## 🚀 주요 업데이트 - Zustand 버전

**zustand-version** 브랜치에는 다음과 같은 중요한 개선 사항이 적용되었습니다:

1. **Zustand 상태 관리 도입**
   - Context API에서 Zustand로 상태 관리 전환
   - 글로벌 상태 관리 효율성 향상
   - 컴포넌트 간 데이터 흐름 최적화
   - Prop Drilling 문제 해결

2. **애플 디자인 철학 적용**
   - 미니멀하고 세련된 UI 디자인 적용
   - 애플의 컬러 팔레트 사용 (#1d1d1f, #424245, #86868b, #f5f5f7)
   - 타이포그래피 및 여백 최적화
   - 부드러운 인터랙션 및 트랜지션 효과

3. **성능 최적화**
   - 불필요한 로그 출력 제거
   - 렌더링 최적화
   - 코드 중복 제거 및 모듈화
   - 디버깅 체계 개선

4. **UI/UX 대폭 개선**
   - 섹션별 특화 디자인 적용
   - FAQ 섹션 아코디언 스타일 구현
   - 카드 기반 레이아웃으로 가독성 향상
   - 섹션 헤더와 콘텐츠 구분 명확화

## 최근 업데이트

### 2024년 06월 - zustand-version 브랜치 추가
- Zustand 상태 관리 라이브러리 도입
- 애플 디자인 철학 기반 UI 전면 개편
- FAQ 섹션 UI 완전 개선 - 아코디언 형태 구현
- 섹션 디자인 미니멀리즘 적용
- 사용자 경험 향상을 위한 인터랙션 개선
- 불필요한 로그 출력 제거 및 성능 최적화

### 2024년 05월 - UI/UX 개선
- 자주 묻는 질문(FAQ) 섹션 UI 개선 - 아코디언 스타일 적용
- 핵심 기능 섹션 디자인 개선 - 애플 스타일의 목록 및 카드 적용
- 혜택/이점 섹션 추가 - 인터랙티브 카드 형태로 구현
- 제품 정보 섹션 - 테이블 형태 레이아웃 최적화
- 섹션별 전용 렌더링 로직 구현으로 콘텐츠 가독성 향상
- 마이크로 인터랙션 및 애니메이션 효과 추가

## 주요 기능

- AI를 활용한 상세페이지 자동 생성
- 섹션별 콘텐츠 편집 및 재생성
- 섹션 순서 변경(드래그 앤 드롭)
- 섹션 숨기기/표시 기능
- 상세페이지 HTML 및 마크다운 변환
- PDF 다운로드 기능
- 반응형 UI(데스크톱 및 모바일 지원)
- 클립보드 복사 기능
- 무료/프리미엄 요금제 지원(Stripe 결제)
- Google 로그인 지원(Supabase)

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
- **상태 관리**: Zustand (zustand-version 브랜치)
- **UI 컴포넌트**: Shadcn/ui, Radix UI
- **백엔드**: Next.js API 라우트, Supabase(인증 및 데이터베이스)
- **AI**: Google Gemini API
- **결제**: Stripe
- **배포**: Vercel/Netlify 지원

## 시작하기

### 사전 요구사항

- Node.js 18 이상 또는 Bun 1.x 이상
- Supabase 계정
- Stripe 계정
- Google Gemini API 키

### 설치

1. 레포지토리 클론:

```bash
git clone https://github.com/EungjePark/sangsae.git
cd sangsae
```

2. 브랜치 선택:

```bash
# 기본 버전
git checkout master

# Zustand 적용 버전
git checkout zustand-version
```

3. 의존성 설치:

```bash
npm install
# 또는
yarn install
# 또는
bun install
```

4. 환경 변수 설정:

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 API 키와 설정 정보를 입력합니다:

```bash
cp .env.local.example .env.local
```

5. 개발 서버 실행:

```bash
npm run dev
# 또는
yarn dev
# 또는
bun run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

## 프로젝트 구조

```
DetailCraft/
├── app/                  # Next.js App Router 컴포넌트 (진행 중)
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트 
│   ├── product/          # 상품 상세 관련 컴포넌트
│   ├── product-detail-viewer/ # 상품 상세 뷰어 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트 (Shadcn/ui 기반)
├── hooks/                # 커스텀 React 훅
├── lib/                  # 유틸리티 및 서비스 함수
│   ├── api/              # API 통신 관련 유틸리티
│   ├── generators/       # AI 생성 관련 로직
│   ├── modules/          # 기능별 모듈
│   ├── sections/         # 섹션 관리 로직
│   ├── store/            # Zustand 상태 관리 (zustand-version)
│   └── tokens/           # 토큰 사용량 관리
├── pages/                # Next.js 페이지 컴포넌트
│   ├── api/              # API 라우트
│   ├── _app.tsx          # Next.js 앱 컴포넌트
│   ├── index.tsx         # 랜딩 페이지
│   ├── login.tsx         # 로그인 페이지
│   ├── signup.tsx        # 회원가입 페이지
│   └── app.tsx           # 메인 앱 페이지 (상세페이지 생성 도구)
├── public/               # 정적 파일
├── styles/               # 전역 스타일
└── types/                # TypeScript 타입 정의
    └── product.ts        # 상품 관련 타입 정의
```

## 브랜치 정보

- **master**: 기본 버전
- **zustand-version**: Zustand 상태 관리 및 애플 디자인 적용 버전

## 기여하기

이슈 및 풀 리퀘스트는 언제나 환영합니다. 중요한 변경사항의 경우 먼저 이슈를 열어 논의하세요.

## 라이선스

[MIT](LICENSE)
