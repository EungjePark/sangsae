import { type ProductDetailContent, type ProductInfo, type ProductDetailSection, type ProductCategory, ProductDetailParams } from '@/types/product';
import { getKoreanTitle } from '@/lib/sections/section-manager';
import { handleApiError, isSuccessResponse, ApiErrorResponse, extractErrorMessage } from './error-handler';
import { apiCache } from './cacheManager';

// API 응답을 위한 타입 정의
type ApiResponse<T> = {
  data?: T;
  error?: string;
  status?: number;
};

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
export async function generateProductDetailApi(
  data: ProductDetailParams
): Promise<ApiResponse<{ sections: Record<string, { content: string }> }>> {
  try {
    // 캐시 키 생성
    const cacheKey = apiCache.generateKey({
      action: 'generateProductDetail',
      productName: data.name,
      productCategory: data.category,
      productDescription: data.description || '',
      targetCustomers: data.targetCustomers || '', 
    });
    
    // 캐시 확인
    const cachedResult = apiCache.get<{ sections: Record<string, { content: string }> }>(cacheKey);
    if (cachedResult) {
      console.log(`캐시된 제품 상세 API 결과 사용: ${data.name}`);
      return { data: cachedResult, status: 200 };
    }
    
    // API 호출
    const response = await fetch('/api/generate-product-detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // 응답 처리
    if (isSuccessResponse(response)) {
      const result = await response.json();
      
      // 결과 캐싱 (20분간 유효)
      apiCache.set(cacheKey, result, 20 * 60 * 1000);
      
      return { data: result, status: 200 };
    } else {
      throw await handleApiError(response);
    }
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('상세 페이지 생성 오류:', apiError);
    
    return {
      error: extractErrorMessage(apiError),
      status: apiError.status || 500
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
  params: {
    sectionId: string;
    productInfo: ProductInfo;
  }
): Promise<ApiResponse<{ sections: Record<string, { content: string }> }>> {
  try {
    // 캐시 키 생성
    const cacheKey = apiCache.generateKey({
      action: 'regenerateSection',
      sectionId: params.sectionId,
      productName: params.productInfo.name,
      productCategory: params.productInfo.category,
      targetCustomers: params.productInfo.targetCustomers || '',
    });
    
    // 캐시 확인 - 섹션 재생성은 동일한 입력에 대해 다양한 결과를 원할 수 있으므로 캐싱 확률 제한
    const shouldUseCache = Math.random() < 0.2; // 20% 확률로만 캐시 사용
    
    if (shouldUseCache) {
      const cachedResult = apiCache.get<{ sections: Record<string, { content: string }> }>(cacheKey);
      if (cachedResult) {
        console.log(`캐시된 섹션 재생성 결과 사용: ${params.sectionId}`);
        return { data: cachedResult, status: 200 };
      }
    }
    
    // API 호출
    const response = await fetch('/api/regenerate-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    // 응답 처리
    if (isSuccessResponse(response)) {
      const result = await response.json();
      
      // 결과 캐싱 (10분간 유효, 짧게 설정하여 다양성 보장)
      apiCache.set(cacheKey, result, 10 * 60 * 1000);
      
      return { data: result, status: 200 };
    } else {
      throw await handleApiError(response);
    }
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('섹션 재생성 오류:', apiError);
    
    return {
      error: extractErrorMessage(apiError),
      status: apiError.status || 500
    };
  }
} 