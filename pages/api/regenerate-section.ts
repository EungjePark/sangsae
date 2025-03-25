import { NextApiRequest, NextApiResponse } from 'next';
import { regenerateSection } from '@/lib/generators/section-regenerator';
import { ProductData, ProductDetailContent, ProductDetailSection } from '@/types/product';

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
    const { sectionId, productData, currentContent } = req.body;

    // 필수 매개변수 검증
    if (!sectionId || !productData || !currentContent) {
      return res.status(400).json({
        error: '필수 매개변수가 누락되었습니다',
        errorCode: 'MISSING_PARAMETERS' 
      });
    }

    // 섹션 ID 검증 - 배열 또는 객체 형태 모두 처리
    if (!currentContent.sections) {
      return res.status(400).json({
        error: '섹션 데이터가 없습니다',
        errorCode: 'NO_SECTIONS'
      });
    }
    
    // 섹션 유효성 검사 (배열이면 some 사용, 배열이 아니면 객체로 처리)
    const isValidSectionId = Array.isArray(currentContent.sections) 
      ? currentContent.sections.some((section: ProductDetailSection) => section.id === sectionId)
      : Object.keys(currentContent.sections).includes(sectionId);
    
    if (!isValidSectionId) {
      return res.status(400).json({
        error: '유효하지 않은 섹션 ID입니다',
        errorCode: 'INVALID_SECTION_ID'
      });
    }

    // 제품 데이터 검증
    if (!productData.name || !productData.category) {
      return res.status(400).json({
        error: '제품 데이터가 불완전합니다',
        errorCode: 'INVALID_PRODUCT_DATA'
      });
    }

    // 섹션 재생성 실행
    const result = await regenerateSection(
      sectionId,
      productData as ProductData,
      currentContent as ProductDetailContent
    );

    // 성공 응답
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('섹션 재생성 API 오류:', error);
    
    // 오류 응답
    return res.status(500).json({
      error: error.message || '섹션 재생성 중 오류가 발생했습니다',
      errorCode: 'REGENERATION_ERROR'
    });
  }
} 