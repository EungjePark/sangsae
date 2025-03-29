import { type ProductDetailContent, type ProductInfo, type ProductDetailSection, type ProductCategory } from '@/types/product';
import { getKoreanTitle } from '@/lib/sections/section-manager';
import { handleApiError, isSuccessResponse, ApiErrorResponse, extractErrorMessage } from './error-handler';

// API 응답을 위한 타입 정의
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// 토큰 사용량 타입
export interface TokenUsage {
  input: number;
  output: number;
}

/**
 * 상품 상세 페이지 생성 API 호출
 * @param productInfo 상품 정보
 * @returns 생성된 상세 페이지 콘텐츠와 상태
 */
export async function generateProductDetailApi(productInfo: ProductInfo): Promise<ApiResponse<ProductDetailContent>> {
  try {
    const response = await fetch('/api/generate-product-detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productInfo),
    });

    // 응답 상태 확인
    if (!isSuccessResponse(response)) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || '상세페이지 생성 중 오류가 발생했습니다.';
      const apiError = handleApiError({ ...response, message: errorMessage });
      
      return {
        error: apiError.message,
        status: apiError.status
      };
    }

    const data = await response.json();
    console.debug('API 원본 응답:', data);

    // 응답 데이터 처리
    let sections: ProductDetailSection[] = [];
    let html = '';
    let markdown = '';
    let cacheName = `generated-${Date.now()}`;
    let rawContent = '';
    let updatedAt = new Date().toISOString();
    let tokenUsage = data.tokenUsage || { input: 0, output: 0 };

    if (data.sections && Array.isArray(data.sections)) {
      sections = data.sections;
    } else if (data.sections?.sections && Array.isArray(data.sections.sections)) {
      sections = data.sections.sections;
      html = data.sections.html || '';
      markdown = data.sections.markdown || '';
      cacheName = data.sections.cacheName || cacheName;
      rawContent = data.sections.rawContent || '';
      updatedAt = data.sections.updatedAt || updatedAt;
    } else {
      console.error('예상치 못한 응답 구조:', data);
    }

    // 섹션 콘텐츠 정리 (필요한 경우)
    const cleanedSections = sections.map((section: ProductDetailSection) => {
      let content = section.content || '';
      const koreanTitle = getKoreanTitle(section.id);
      
      if (content.startsWith(koreanTitle)) {
        content = content.substring(koreanTitle.length).trim();
      } else if (content.startsWith(section.id)) {
        content = content.substring(section.id.length).trim();
      }
      
      return { ...section, content: content };
    });

    const result: ProductDetailContent = {
      sections: cleanedSections,
      cacheName,
      rawContent,
      html,
      markdown,
      updatedAt,
      tokenUsage
    };

    console.debug('처리된 결과 구조:', result);
    console.debug('토큰 사용량:', tokenUsage);

    return {
      data: result,
      status: 200
    };
  } catch (error: unknown) {
    // 중앙화된 에러 핸들러로 에러 처리
    const apiError = handleApiError(error, '상세페이지 생성 중 오류가 발생했습니다.');
    console.error('생성 오류:', apiError);
    
    return {
      error: apiError.message,
      status: apiError.status
    };
  }
}

/**
 * 특정 섹션만 재생성하는 API 호출
 * @param sectionId 재생성할 섹션 ID
 * @param productData 상품 정보
 * @param currentContent 현재 콘텐츠 상태
 * @param cacheName 캐시 이름 (있는 경우)
 * @returns 재생성된 섹션 데이터와 상태
 */
export async function regenerateSectionApi(
  sectionId: string,
  productData: ProductInfo,
  currentContent: { sections: Record<string, { content: string }> },
  cacheName?: string
): Promise<ApiResponse<{ sections: Record<string, { content: string }> }>> {
  try {
    const requestBody = {
      sectionId,
      productData,
      currentContent,
      cacheName
    };

    const response = await fetch('/api/regenerate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // 응답 상태 확인
    if (!isSuccessResponse(response)) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || '섹션 재생성 중 오류가 발생했습니다.';
      const apiError = handleApiError({ ...response, message: errorMessage });
      
      return {
        error: apiError.message,
        status: apiError.status
      };
    }

    const data = await response.json();
    return {
      data,
      status: 200
    };
  } catch (error: unknown) {
    // 중앙화된 에러 핸들러로 에러 처리
    const apiError = handleApiError(error, '섹션 재생성 중 오류가 발생했습니다.');
    console.error('섹션 재생성 중 오류 발생:', apiError);
    
    return {
      error: apiError.message,
      status: apiError.status
    };
  }
} 