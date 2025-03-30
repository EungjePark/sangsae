# 상세 - AI 제품 상세페이지 생성기

AI 기반 제품 상세페이지 콘텐츠 생성 및 관리 도구입니다. Gemini API를 활용하여 제품 정보를 기반으로 완성도 높은 제품 상세페이지를 자동으로 생성합니다.

## 주요 기능

- **AI 기반 제품 상세페이지 생성**: 제품명, 카테고리, 키워드만으로 완성도 높은 상세 페이지 생성
- **섹션별 콘텐츠 관리**: 생성된 섹션 별 콘텐츠 편집, 재생성, 순서 변경, 숨김 기능
- **다양한 내보내기 옵션**: PDF 내보내기, 클립보드 복사 기능
- **직관적인 UI/UX**: 드래그 앤 드롭으로 섹션 순서 변경, 실시간 편집 기능
- **카테고리별 최적화**: 다양한 제품 카테고리에 최적화된 콘텐츠 생성

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, TailwindCSS, Shadcn/UI
- **백엔드**: Next.js API Routes
- **AI**: Google Gemini API (gemini-1.5-flash 모델)
- **상태관리**: Zustand
- **스타일링**: TailwindCSS, CSS Modules

## 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/yourusername/sangsae.git
cd sangsae
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가합니다:
```
GEMINI_API_KEY=your_gemini_api_key
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 확인
http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

## 주요 기능 설명

### 제품 정보 입력 폼
- 제품명, 카테고리, 키워드, 타겟 고객 등의 정보를 입력
- 다중 키워드 입력 지원
- 제품 카테고리별 최적화된 입력 필드 제공

### AI 콘텐츠 생성
- Gemini API를 활용한 고품질 콘텐츠 생성
- 마크다운 및 HTML 형식 지원
- 최적화된 프롬프트 엔지니어링으로 높은 품질의 콘텐츠 생성

### 콘텐츠 관리 및 편집
- 섹션별 콘텐츠 편집 기능
- 드래그 앤 드롭으로 섹션 순서 변경
- 불필요한 섹션 숨김 기능
- 개별 섹션 재생성 기능

### 내보내기 및 공유
- PDF 형식으로 내보내기
- 클립보드에 전체 콘텐츠 또는 개별 섹션 복사
- 미리보기 모드 지원

## 프로젝트 구조

```
/components             # UI 컴포넌트
  /product-detail-viewer  # 제품 상세 뷰어 컴포넌트
  /ui                     # 공통 UI 컴포넌트
/lib                    # 유틸리티 함수 및 API 클라이언트
  /api                    # API 클라이언트 및 관련 유틸리티
  /generators             # AI 콘텐츠 생성 관련 함수
  /sections               # 섹션 관리 관련 유틸리티
  /store                  # Zustand 스토어
/pages                  # Next.js 페이지
  /api                    # API 라우트
/public                 # 정적 파일
/styles                 # 전역 스타일
/types                  # TypeScript 타입 정의
```

## 라이센스

MIT
