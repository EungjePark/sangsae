export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

export const cleanupParentheses = (text: string): string => {
  if (!text) return '';

  let cleanedText = text;

  // 예) -> 예: 변환
  cleanedText = cleanedText.replace(/예\)\s*/g, '예: ');

  // 불필요한 괄호 패턴 제거 또는 정리
  cleanedText = cleanedText.replace(/\(\s*\)/g, ''); // 빈 괄호 제거
  cleanedText = cleanedText.replace(/\(\s*,\s*\)/g, ''); // (,) 같은 패턴 제거
  cleanedText = cleanedText.replace(/\(\s*:\s*\)/g, ''); // (:) 같은 패턴 제거

  return cleanedText;
};

// 개선된 콜론 정리 함수 - 더 강력한 처리 추가
export const cleanupColons = (text: string): string => {
  if (!text) return '';

  // 먼저 괄호 정리 적용
  let cleanedText = cleanupParentheses(text);

  // Q:, A: 형식 표준화 (Q: 와 A: 뒤에 공백 보장)
  cleanedText = cleanedText.replace(/^(Q|A)\s*[:：](?:\s*[:：])*/img, '$1: ');

  // "답변 준비 중입니다" 문구 제거 (실제 답변으로 대체할 예정)
  cleanedText = cleanedText.replace(/답변 준비 중입니다\.\s*곧 업데이트 될 예정입니다\./g, '');

  // 제목에서 콜론 제거 (첫 번째 줄이나 단락 시작점)
  cleanedText = cleanedText.replace(/^([^:：\n\r]+)[:：](\s*)/gm, '$1$2');

  // 문장 끝 콜론 제거 (줄바꿈 또는 문장 끝)
  cleanedText = cleanedText.replace(/([^:])[:：]\s*(\n|$)/g, '$1$2');

  // 불필요한 이중/삼중 콜론 제거
  cleanedText = cleanedText.replace(/[:：]{2,}/g, ':');

  // 문장 중간의 콜론 처리 (고유명사, 시간 표시 등 제외) - 더 강력한 패턴 적용
  cleanedText = cleanedText.replace(/([가-힣a-zA-Z])[:：]([가-힣a-zA-Z])/g, '$1, $2');

  // 특수 경우를 제외하고 콜론 뒤에 항상 공백 추가
  cleanedText = cleanedText.replace(/([^0-9\s])[:：]([^\s])/g, '$1: $2');

  // 제목이나 항목에서 콜론 완전히 제거
  cleanedText = cleanedText.replace(/^([\s]*[▶•★◆✓✔]+[\s]*[^:：\n\r]+)[:：]/gm, '$1');

  // 앞서 처리하지 못한 불필요한 콜론을 모두 쉼표로 변경
  cleanedText = cleanedText.replace(/([^0-9])[:：]([^0-9])/g, '$1, $2');

  return cleanedText.trim();
};
