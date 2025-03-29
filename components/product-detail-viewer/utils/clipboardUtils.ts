import { stripHtmlTags } from './contentFormatters';

export const copyToClipboard = async (content: string, isHtml: boolean = false): Promise<boolean> => {
  try {
    // HTML 태그가 있는 경우 텍스트 복사 시 태그 제거
    const textToCopy = isHtml ? content : stripHtmlTags(content);

    if (navigator.clipboard && window.isSecureContext) {
      // 보안 컨텍스트에서는 Clipboard API 사용
      await navigator.clipboard.writeText(textToCopy);
    } else {
      // 대체 방법 (less secure)
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    return true;
  } catch (err) {
    console.error('클립보드 복사 오류:', err);
    return false;
  }
};

// 이 함수들은 UI 컴포넌트 (예: ActionToolbar) 내부나 해당 컴포넌트와 연결된 핸들러에서
// 직접 copyToClipboard를 호출하고 toast를 사용하는 것이 더 적절할 수 있습니다.
// 유틸리티 파일에 UI 로직(toast)을 포함하는 것은 분리 원칙에 어긋날 수 있습니다.
// 여기서는 계획에 따라 포함하지만, 실제 구현 시 검토가 필요합니다.

export const handleCopyContentToClipboard = async (content: string, toast: any) => {
  const success = await copyToClipboard(content); // HTML 포함 복사 가정
  if (success) {
    toast({
      title: "복사 완료",
      description: "콘텐츠가 클립보드에 복사되었습니다" // 메시지 수정: HTML 포함 여부 명시 안 함
    });
  } else {
    toast({
      title: "복사 실패",
      description: "클립보드 복사 중 오류가 발생했습니다",
      variant: "destructive"
    });
  }
  return success; // Return the success status
};

export const handleCopyTextOnly = async (htmlContent: string, toast: any) => {
  const success = await copyToClipboard(htmlContent, false); // HTML 제거하고 복사
  if (success) {
    toast({
      title: "복사 완료",
      description: "HTML 태그가 제거된 텍스트가 클립보드에 복사되었습니다"
    });
  } else {
    toast({
      title: "복사 실패",
      description: "클립보드 복사 중 오류가 발생했습니다",
      variant: "destructive"
    });
  }
  return success; // Return the success status
};
