# DetailCraft (상세-세공)

DetailCraft는 AI(Google Gemini)를 활용하여 이커머스 상세페이지를 빠르고 쉽게 생성할 수 있는 웹 애플리케이션입니다. 사용자가 상품 정보(상품명, 카테고리, 설명 등)를 입력하면 AI가 자동으로 전문적인 상세페이지를 생성해 주며, 생성된 콘텐츠는 편집, 재생성, 복사, PDF 다운로드 등 다양한 방식으로 활용할 수 있습니다.

## 🔄 리팩토링 진행 중

현재 이 프로젝트는 대대적인 리팩토링을 진행 중입니다. 주요 리팩토링 목표는 다음과 같습니다:

1. **코드 구조와 아키텍처 개선**
   - 중복 코드 제거
   - 대형 컴포넌트를 작은 단위로 모듈화
   - 관심사 분리를 통한 유지보수성 향상

2. **성능 최적화**
   - 캐싱을 통한 API 호출 최소화
   - 코드 스플리팅 및 지연 로딩
   - 번들 크기 축소

3. **UI/UX 개선**
   - 애플 디자인 철학을 적용한 세련된 인터페이스
   - 브랜드 컬러와 일관된 디자인 언어 적용
   - 섹션별 맞춤형 레이아웃과 애니메이션 효과
   - 인터랙티브 요소 개선 (FAQ 아코디언, 기능 카드 등)

4. **코드 품질 개선**
   - 타입 정의 강화 (any 타입 줄이기)
   - 일관된 코딩 스타일과 네이밍 규칙 적용
   - 테스트 코드 도입

5. **상태 관리 개선**
   - Context API 또는 Zustand 등 상태 관리 도구 도입
   - Prop Drilling 최소화

## 최근 업데이트

### 2024년 06월 - UI/UX 개선
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
- 상세페이지 HTML 및 마크다운 변환
- PDF 다운로드 기능
- 반응형 UI(데스크톱 및 모바일 지원)
- 클립보드 복사 기능
- 무료/프리미엄 요금제 지원(Stripe 결제)
- Google 로그인 지원(Supabase)

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
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
git clone https://github.com/your-username/DetailCraft.git
cd DetailCraft
```

2. 의존성 설치:

```bash
npm install
# 또는
yarn install
# 또는
bun install
```

3. 환경 변수 설정:

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 API 키와 설정 정보를 입력합니다:

```bash
cp .env.local.example .env.local
```

4. 개발 서버 실행:

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

## 모듈화 지침

신규 기능을 개발할 때는 다음과 같은 모듈화 원칙을 따릅니다:

1. **컴포넌트 분리**: 500라인 이상의 큰 컴포넌트는 작은 단위로 분리
2. **관심사 분리**: UI 렌더링과 비즈니스 로직 분리
3. **상태 관리**: 전역/지역 상태 관리 전략 명확히 구분
4. **재사용성**: 중복 코드 최소화 및 재사용 가능한 함수/컴포넌트 작성
5. **문서화**: 복잡한 로직에 주석 추가 및 README 업데이트

## 기여하기

이슈 및 풀 리퀘스트는 언제나 환영합니다. 중요한 변경사항의 경우 먼저 이슈를 열어 논의하세요.

## 라이선스

[MIT](LICENSE)
