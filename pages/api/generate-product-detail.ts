import { NextApiRequest, NextApiResponse } from 'next';
import { generateProductDetailContent } from '@/lib/generators/product-detail';
import { ProductCategory, ProductData } from '@/types/product';

// API 라우트 핸들러
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '지원하지 않는 메소드입니다', errorCode: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const productData: ProductData = req.body;

    // 필수 매개변수 검증
    if (!productData.name || !productData.category) {
      return res.status(400).json({
        error: '제품명과 카테고리는 필수 입력 항목입니다',
        errorCode: 'MISSING_PARAMETERS' 
      });
    }

    // 제품 카테고리 유효성 검증
    const validCategories: ProductCategory[] = [
      'cosmetics', 'food', 'fashion', 'home', 'electronics', 
      'furniture', 'pet', 'baby', 'health', 'sports', 'outdoor', 
      'digital', 'books', 'toys', 'craft', 'stationery', 'etc'
    ];

    if (!validCategories.includes(productData.category as ProductCategory)) {
      return res.status(400).json({
        error: '유효하지 않은 카테고리입니다',
        errorCode: 'INVALID_CATEGORY'
      });
    }

    // 키워드 유효성 검증
    if (!productData.keywords || 
        (Array.isArray(productData.keywords) && productData.keywords.length === 0)) {
      return res.status(400).json({
        error: '최소 하나 이상의 키워드가 필요합니다',
        errorCode: 'MISSING_KEYWORDS'
      });
    }

    // 상세 페이지 콘텐츠 생성
    const result = await generateProductDetailContent(productData);

    // 응답 형식 변환 (API 클라이언트 요구 사항에 맞게)
    const sectionsRecord: Record<string, { content: string }> = {};
    result.sections.forEach(section => {
      sectionsRecord[section.id] = { content: section.content };
    });

    // 성공 응답
    return res.status(200).json({
      sections: sectionsRecord,
      meta: {
        generatedAt: result.updatedAt,
        tokenUsage: result.tokenUsage
      }
    });
  } catch (error: any) {
    console.error('상세 페이지 생성 오류:', error);
    
    // 오류 응답
    return res.status(500).json({
      error: error.message || '상세 페이지 생성 중 오류가 발생했습니다',
      errorCode: 'GENERATION_ERROR'
    });
  }
} 