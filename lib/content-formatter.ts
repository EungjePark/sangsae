/**
 * 콘텐츠 포맷팅을 위한 유틸리티 함수 모음
 * 여러 컴포넌트에서 재사용할 수 있는 포맷팅 로직을 제공합니다.
 */

/**
 * 마크다운 강조 표시(**)를 제거하고 텍스트를 친근한 문체로 변환합니다.
 * @param content 원본 텍스트 콘텐츠
 * @returns 포맷팅된 텍스트
 */
export function formatContent(content: string): string {
  if (!content) return '';
  
  // 섹션 ID 태그 제거 (예: [main_feature])
  let formattedContent = content.replace(/^\[.*?\]\s*/, '');
  
  // 마크다운 강조 표시(**) 제거 - 더 강화된 정규식 패턴
  formattedContent = formattedContent.replace(/\*\*/g, '');
  
  // 불렛 포인트 뒤에 있는 별표(**) 제거 (예: * **텍스트:** -> * 텍스트:)
  formattedContent = formattedContent.replace(/\*\s+\*\*(.*?)\*\*/g, '* $1');
  
  // 숫자 목록 뒤에 있는 별표(**) 제거 (예: 1. **텍스트:** -> 1. 텍스트:)
  formattedContent = formattedContent.replace(/(\d+\.)\s+\*\*(.*?)\*\*/g, '$1 $2');
  
  // 불렛 포인트 포맷팅
  formattedContent = formattedContent.replace(/•\s*/g, '• ');
  formattedContent = formattedContent.replace(/\n•/g, '\n• ');
  formattedContent = formattedContent.replace(/\*\s*/g, '* ');
  formattedContent = formattedContent.replace(/\n\*/g, '\n* ');
  
  // 중첩된 별표 처리 (예: ***강조된 텍스트*** -> 강조된 텍스트)
  formattedContent = formattedContent.replace(/\*{3}(.*?)\*{3}/g, '$1');
  
  // 남아있는 별표 제거
  formattedContent = formattedContent.replace(/\*/g, '');
  
  // 더블 스페이스 제거
  formattedContent = formattedContent.replace(/\s{2,}/g, ' ');
  
  // 번호 목록 포맷팅
  formattedContent = formattedContent.replace(/(\d+\.)\s*/g, '$1 ');
  
  // 콜론 뒤에 스페이스 추가
  formattedContent = formattedContent.replace(/([^:]):([^\s])/g, '$1: $2');
  
  // 줄바꿈이 너무 많은 경우 정리
  formattedContent = formattedContent.replace(/\n{3,}/g, '\n\n');
  
  return formattedContent;
}

/**
 * 텍스트를 친근한 문체로 변환합니다.
 * @param content 원본 텍스트
 * @returns 친근한 문체로 변환된 텍스트
 */
export function makeContentFriendly(content: string): string {
  if (!content) return '';
  
  // 마크다운 강조 표시(**) 제거 - 더 강화된 정규식 패턴
  let friendlyContent = content.replace(/\*\*/g, '');
  
  // 불렛 포인트 뒤에 있는 별표(**) 제거 (예: * **텍스트:** -> * 텍스트:)
  friendlyContent = friendlyContent.replace(/\*\s+\*\*(.*?)\*\*/g, '* $1');
  
  // 숫자 목록 뒤에 있는 별표(**) 제거 (예: 1. **텍스트:** -> 1. 텍스트:)
  friendlyContent = friendlyContent.replace(/(\d+\.)\s+\*\*(.*?)\*\*/g, '$1 $2');
  
  // 불렛 포인트 포맷팅
  friendlyContent = friendlyContent.replace(/•\s*/g, '• ');
  friendlyContent = friendlyContent.replace(/\n•/g, '\n• ');
  friendlyContent = friendlyContent.replace(/\*\s*/g, '* ');
  friendlyContent = friendlyContent.replace(/\n\*/g, '\n* ');
  
  // 문체 변환
  friendlyContent = friendlyContent
    .replace(/입니다\./g, '이에요.')
    .replace(/합니다\./g, '해요.')
    .replace(/됩니다\./g, '돼요.')
    .replace(/있습니다\./g, '있어요.')
    .replace(/습니다\./g, '어요.');
  
  return friendlyContent;
}

/**
 * 클립보드용 텍스트 포맷팅
 * @param content 원본 텍스트
 * @param title 섹션 제목
 * @returns 클립보드에 복사할 포맷팅된 텍스트
 */
export function formatForClipboard(content: string, title: string): string {
  if (!content) return '';
  
  // 섹션 ID 태그 제거
  let formattedContent = content.replace(/^\[.*?\]\s*/, '');
  
  // 마크다운 강조 표시(**) 제거 - 더 강화된 정규식 패턴
  formattedContent = formattedContent.replace(/\*\*/g, '');
  
  // 불렛 포인트 뒤에 있는 별표(**) 제거 (예: * **텍스트:** -> * 텍스트:)
  formattedContent = formattedContent.replace(/\*\s+\*\*(.*?)\*\*/g, '* $1');
  
  // 숫자 목록 뒤에 있는 별표(**) 제거 (예: 1. **텍스트:** -> 1. 텍스트:)
  formattedContent = formattedContent.replace(/(\d+\.)\s+\*\*(.*?)\*\*/g, '$1 $2');
  
  // 불렛 포인트 포맷팅
  formattedContent = formattedContent.replace(/•\s*/g, '• ');
  formattedContent = formattedContent.replace(/\n•/g, '\n• ');
  formattedContent = formattedContent.replace(/\*\s*/g, '* ');
  formattedContent = formattedContent.replace(/\n\*/g, '\n* ');
  
  // 문체 변환
  formattedContent = formattedContent
    .replace(/입니다\./g, '이에요.')
    .replace(/합니다\./g, '해요.')
    .replace(/됩니다\./g, '돼요.')
    .replace(/있습니다\./g, '있어요.')
    .replace(/습니다\./g, '어요.');
  
  return `${title}\n${formattedContent}\n\n`;
}
