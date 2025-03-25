# 컴포넌트 문서

## UI 컴포넌트

### LoadingSpinner
**경로**: `/components/ui/loading-spinner.tsx`

**설명**: 로딩 상태를 표시하는 스피너 컴포넌트입니다. 다양한 크기와 텍스트 옵션을 지원합니다.

**속성**:
- `size`: 스피너 크기 (xs, sm, md, lg)
- `showText`: 로딩 텍스트 표시 여부
- `text`: 커스텀 로딩 텍스트
- `className`: 추가 스타일 클래스

**사용 예**:
```tsx
<LoadingSpinner size="md" showText={true} text="콘텐츠를 생성 중입니다..." />
```

### FullPageLoader
**경로**: `/components/ui/loading-spinner.tsx`

**설명**: 전체 페이지 로딩 화면을 제공하는 컴포넌트입니다.

**속성**:
- `text`: 커스텀 로딩 텍스트 (기본값: "멋진 상세페이지를 만들고 있어요...")

**사용 예**:
```tsx
<FullPageLoader text="데이터를 처리하고 있습니다..." />
```

## 상품 관련 컴포넌트

### GeneratedContent
**경로**: `/components/product/GeneratedContent.tsx`

**설명**: 생성된 상품 상세 페이지 콘텐츠를 표시하고 관리하는 컴포넌트입니다.

**속성**:
- `generatedContent`: 생성된 콘텐츠 데이터
- `onSectionUpdate`: 섹션 업데이트 콜백 함수
- `onRegenerate`: 섹션 재생성 콜백 함수
- `isRegenerating`: 재생성 중인 섹션 상태

**주요 기능**:
- 섹션 드래그 앤 드롭으로 순서 변경
- 섹션 숨김/표시 토글
- 섹션 내용 편집
- 섹션 개별 재생성

**사용 예**:
```tsx
<GeneratedContent 
  generatedContent={generatedContent} 
  onSectionUpdate={handleSectionUpdate}
  onRegenerate={handleRegenerate}
  isRegenerating={regeneratingState}
/>
```

## 커스텀 훅

### useSectionManagement
**경로**: `/hooks/product/useSectionManagement.ts`

**설명**: 생성된 콘텐츠의 섹션을 관리하는 커스텀 훅입니다.

**반환 값**:
- `hiddenSections`: 숨겨진 섹션 ID 배열
- `sectionOrder`: 섹션 순서 객체
- `draggedSection`: 현재 드래그 중인 섹션 ID
- `isEditing`: 편집 중인 섹션 상태 객체
- `editedContent`: 편집된 콘텐츠 객체
- `getKoreanTitle`: 섹션 ID를 한글 제목으로 변환하는 함수
- `getSectionClasses`: 섹션 클래스 이름을 반환하는 함수
- `getEmoji`: 섹션 ID에 해당하는 이모지를 반환하는 함수
- `handleDragStart`: 드래그 시작 핸들러
- `handleDragOver`: 드래그 오버 핸들러
- `handleDrop`: 드롭 핸들러
- `handleDragEnd`: 드래그 종료 핸들러
- `toggleSection`: 섹션 숨김/표시 토글 함수
- `startEdit`: 섹션 편집 시작 함수
- `cancelEdit`: 섹션 편집 취소 함수
- `saveEdit`: 섹션 편집 저장 함수
- `makeContentFriendly`: 콘텐츠를 보기 좋게 변환하는 함수

**사용 예**:
```tsx
const {
  hiddenSections,
  sectionOrder,
  getKoreanTitle,
  toggleSection,
  handleDragStart,
  handleDragOver,
  handleDrop
} = useSectionManagement();
```

## API 통합

### Gemini API 통합
**경로**: `/lib/gemini.ts`

**설명**: Google Gemini API를 활용한 콘텐츠 생성 로직입니다.

**주요 함수**:
- `generateProductDetail`: 상품 정보를 바탕으로 상세 페이지 콘텐츠 생성
- `regenerateSection`: 특정 섹션만 재생성
- `getCurrentApiKey`: 현재 API 키 반환
- `rotateApiKey`: API 키 로테이션 (여러 키 사용 시)

**사용 예**:
```tsx
const productData = {
  name: "제품명",
  category: "전자제품",
  price: "50,000원",
  description: "제품 설명..."
};

const content = await generateProductDetail(productData);
```

## 섹션 재생성 로직

### SectionRegenerator
**경로**: `/lib/generators/section-regenerator.ts`

**설명**: 특정 섹션만 선택적으로 재생성하는 로직입니다.

**주요 함수**:
- `regenerateSection`: 섹션 ID와 상품 정보를 받아 해당 섹션만 재생성
- `getPromptForSection`: 섹션별 프롬프트 생성
- `parseRegeneratedContent`: 재생성된 콘텐츠 파싱

**사용 예**:
```tsx
const updatedSection = await regenerateSection(
  "main_feature", 
  productData, 
  existingContent
);
```
