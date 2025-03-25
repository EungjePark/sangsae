# DetailCraft

DetailCraft는 AI를 활용하여 이커머스 상세페이지를 빠르고 쉽게 생성할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- AI를 활용한 상세페이지 자동 생성
- 사용자 친화적인 인터페이스
- 커스터마이징 가능한 템플릿
- 무료 및 프리미엄 요금제 지원
- Google 로그인 지원

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
- **런타임 환경**: Bun (Node.js 대체 JavaScript 런타임)
- **UI 컴포넌트**: Shadcn/ui
- **백엔드**: Supabase (인증 및 데이터베이스)
- **결제**: Stripe
- **스타일링**: Tailwind CSS

## 시작하기

### 사전 요구사항

- Bun 1.x 이상 (https://bun.sh)
- Supabase 계정
- Stripe 계정
- Google Gemini API 키

### 설치

1. 레포지토리 클론:

```bash
git clone https://github.com/your-username/DetailCraft.git
cd DetailCraft
```

2. 의존성 설치 (Bun 사용):

```bash
bun install
```

3. 환경 변수 설정:

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 Supabase와 Stripe 정보를 입력합니다:

```bash
cp .env.local.example .env.local
```

4. 개발 서버 실행:

```bash
bun run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)를 열어 애플리케이션을 확인할 수 있습니다.

## 프로젝트 구조

```
DetailCraft/
├── components/           # UI 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트 (Shadcn/ui 기반)
├── lib/                  # 유틸리티 함수
├── pages/                # 페이지 컴포넌트
│   ├── api/              # API 라우트
│   ├── _app.tsx          # Next.js 앱 컴포넌트
│   ├── index.tsx         # 랜딩 페이지
│   ├── login.tsx         # 로그인 페이지
│   ├── signup.tsx        # 회원가입 페이지
│   └── app.tsx           # 메인 앱 페이지
├── public/               # 정적 파일
└── styles/               # 전역 스타일
```

## 배포

이 프로젝트는 Vercel이나 Netlify에 쉽게 배포할 수 있습니다.

### Vercel에 배포

1. [Vercel](https://vercel.com)에 가입하고 계정을 생성합니다.
2. 새 프로젝트를 생성하고 GitHub 레포지토리를 연결합니다.
3. 환경 변수를 설정합니다.
4. 배포 버튼을 클릭합니다.

## 기여하기

이슈 및 풀 리퀘스트는 언제나 환영합니다. 중요한 변경사항의 경우 먼저 이슈를 열어 논의하세요.

## 라이선스

[MIT](LICENSE)
