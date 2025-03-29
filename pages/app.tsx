import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { type ProductDetailContent, type ProductDetailSection, type ProductCategory, type ProductInfo } from '@/types/product';
import 'katex/dist/katex.min.css';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import ProductInputForm from '@/components/product/ProductInputForm';
import { GeneratedContentViewer } from '@/components/product-detail-viewer';
import { generateProductDetailApi } from '@/lib/api/productService'; // 서비스 레이어 함수 가져오기
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

// html2pdf 타입 선언 추가 (만약 window.html2pdf를 직접 사용하지 않는다면 제거 가능)
declare global {
  interface Window {
    html2pdf: any;
  }
}

const BRAND = {
  color: {
    primary: '#ff68b4',
  },
};

// ProductInfo 타입 확장
interface ExtendedProductInfo extends ProductInfo {
  description: string;
  targetCustomers: string;
  keywords: string[];
  additionalInfo: string;
  shippingInfo: string;
  returnPolicy: string;
}

// 기본 로딩 인디케이터 컴포넌트로 교체 - 팝업 형식으로 전체 화면 위에 표시
const LoadingOverlay = ({ message = "AI가 상세페이지를 생성 중입니다..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl p-10 shadow-xl flex flex-col items-center max-w-md mx-auto">
      <Loader2 className="h-16 w-16 text-[#ff68b4] animate-spin mb-6" />
      <p className="text-xl font-semibold text-gray-700 mb-3 text-center">{message}</p>
      <p className="text-base text-gray-500 text-center">몇 초 정도 소요됩니다.</p>
    </div>
  </div>
);

const AppPage: NextPage = () => {
  const { toast } = useToast();

  // --- State Variables ---
  const [productName, setProductName] = useState<string>('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('etc');
  const [productDescription, setProductDescription] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [shippingInfo, setShippingInfo] = useState<string>('');
  const [returnPolicy, setReturnPolicy] = useState<string>('');
  const [productKeywords, setProductKeywords] = useState<string[]>([]);
  const [targetCustomers, setTargetCustomers] = useState<string>('');
  const [totalTokenUsage, setTotalTokenUsage] = useState<{input: number; output: number}>({input: 0, output: 0});
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [generatedContent, setGeneratedContent] = useState<ProductDetailContent | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<Record<string, number>>({});
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  // --- API Call Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if(!productName || !productCategory || !productDescription) {
      toast({ 
        title: "입력 오류", 
        description: "상품명, 카테고리, 상품 설명은 필수 입력 항목입니다.", 
        variant: "destructive" 
      });
      return;
    }
    
    // 상태 초기화
    setSectionOrder({});
    setHiddenSections([]);
    setDraggedSection(null);
    setError(null);
    setIsGenerating(true);
    setGeneratedContent(null); // 이전 콘텐츠 즉시 제거
    
    const startTime = Date.now();
    
    // 상품 정보 객체 생성
    const productInfo: ExtendedProductInfo = {
      name: productName,
      category: productCategory,
      description: productDescription,
      targetCustomers: targetCustomers,
      keywords: productKeywords,
      additionalInfo: additionalInfo,
      shippingInfo: shippingInfo,
      returnPolicy: returnPolicy
    };
    
    // 서비스 레이어 함수 호출
    const result = await generateProductDetailApi(productInfo);
    
    if (result.error) {
      // 오류 처리
      console.error('생성 오류:', result.error);
      setError(result.error);
      toast({ 
        title: "생성 실패", 
        description: result.error, 
        variant: "destructive" 
      });
    } else if (result.data) {
      // 성공 처리
      // API 응답 데이터를 ProductDetailContent 형식으로 변환
      const apiData = result.data;
      console.log('[App] API 응답 데이터:', apiData);

      const sections = Object.entries(apiData.sections || {}).map(([id, data]) => ({
        id,
        content: data.content,
      })) as ProductDetailSection[];

      console.log('[App] 변환된 섹션 데이터:', sections);
      
      // 원시 콘텐츠 생성 (모든 섹션의 내용 통합)
      const rawContent = sections.map(s => `---섹션시작:${s.id}---\n${s.content}\n---섹션끝---`).join('\n\n');
      console.log('[App] 생성된 원시 콘텐츠 길이:', rawContent.length);
      
      // HTML 및 Markdown 생성 로직 (추후 구현)
      const htmlContent = '<div class="product-content">HTML 컨텐츠는 추후 생성됩니다.</div>';
      const markdownContent = '# Markdown 컨텐츠는 추후 생성됩니다.';
      
      // 캐시 이름 생성 - 상품명과 현재 시간 포함
      const cacheName = `${productName}_${new Date().toISOString().split('T')[0]}`;
      console.log('[App] 생성된 캐시 이름:', cacheName);
      
      const contentData: ProductDetailContent = {
        sections,
        cacheName: cacheName,
        rawContent: rawContent,
        html: htmlContent,
        markdown: markdownContent,
        updatedAt: new Date().toISOString(),
        tokenUsage: { input: 0, output: 0 }
      };

      console.log('[App] 생성된 콘텐츠 데이터:', contentData);
      setGeneratedContent(contentData);
      setTotalTokenUsage({ input: 0, output: 0 }); // API 응답에 없으므로 기본값 사용
      setGenerationTime((Date.now() - startTime) / 1000);
      
      const initialSectionOrder: Record<string, number> = {};
      setSectionOrder(initialSectionOrder);
      
      toast({ title: "생성 완료", description: "상세페이지가 생성되었습니다" });
    }
    
    // 로딩 시간 조정 (필요 시)
    const totalElapsed = Date.now() - startTime;
    const minTotalLoadingTime = 1500; // 최소 로딩 시간 (ms)
    
    if (totalElapsed < minTotalLoadingTime) {
      setTimeout(() => setIsGenerating(false), minTotalLoadingTime - totalElapsed);
    } else {
      setIsGenerating(false);
    }
  };

  // 재생성 핸들러 - 캡슐화 및 개선
  const handleRegenerate = () => {
    if (window.confirm('상세페이지를 새로 생성하시겠습니까? 현재 생성된 내용은 사라집니다.')) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
  };

  // 상품 정보 객체 통합 (카드 표시용)
  const productInfo: ExtendedProductInfo = {
    name: productName,
    category: productCategory,
    description: productDescription,
    targetCustomers: targetCustomers,
    keywords: productKeywords,
    additionalInfo: additionalInfo,
    shippingInfo: shippingInfo,
    returnPolicy: returnPolicy
  };

  // --- JSX ---
  return (
    <>
      <Head> <title>상세페이지 생성 도구</title> <meta name="description" content="AI를 활용한 상세페이지 생성 도구" /> </Head>
      <div className="container max-w-7xl mx-auto py-10 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff68b4] to-[#6c5ce7] bg-clip-text text-transparent">상세페이지 생성 도구</h1>
          <p className="text-gray-600">상품 정보를 입력하면 AI가 상세페이지를 자동으로 생성해 드립니다.</p>
          <p className="text-sm mt-2 inline-block px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ffd1e8] to-[#e4e1fc] text-gray-700">✦ 전문가들이 검증한 효과적인 상세페이지 구조를 적용했어요</p>
        </header>
        
        {/* 두 섹션을 포함하는 컨테이너 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product Input Form - 좌측 (고정 높이) */}
          <div className="lg:w-1/2 flex flex-col h-auto lg:h-[1800px]">
            <ProductInputForm
              productName={productName} setProductName={setProductName} productCategory={productCategory} setProductCategory={setProductCategory}
              productDescription={productDescription} setProductDescription={setProductDescription} additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo}
              shippingInfo={shippingInfo} setShippingInfo={setShippingInfo} returnPolicy={returnPolicy} setReturnPolicy={setReturnPolicy}
              productKeywords={productKeywords} setProductKeywords={setProductKeywords} targetCustomers={targetCustomers} setTargetCustomers={setTargetCustomers}
              isGenerating={isGenerating} generatedContent={generatedContent} onSubmit={handleSubmit}
            />
          </div>
          
          {/* 출력폼 (우측) - 생성된 콘텐츠 또는 빈 상태 */}
          <div className="lg:w-1/2 flex flex-col h-auto lg:h-[1800px]">
            {generatedContent ? (
              /* Generated Content Viewer */
              <div className="h-full flex-grow">
                <GeneratedContentViewer
                  generatedContent={generatedContent} 
                  setGeneratedContent={setGeneratedContent} 
                  isGenerating={isGenerating} 
                  error={error}
                  hiddenSections={hiddenSections} 
                  setHiddenSections={setHiddenSections} 
                  sectionOrder={sectionOrder} 
                  setSectionOrder={setSectionOrder}
                  draggedSection={draggedSection} 
                  setDraggedSection={setDraggedSection} 
                  productName={productName} 
                  productCategory={productCategory}
                  productDescription={productDescription} 
                  additionalInfo={additionalInfo} 
                  shippingInfo={shippingInfo} 
                  returnPolicy={returnPolicy}
                  productKeywords={productKeywords} 
                  targetCustomers={targetCustomers} 
                  handleRegenerate={handleRegenerate}
                />
              </div>
            ) : (
              <div className="h-full flex-grow">
                {/* 빈 상태 (생성 전) */}
                {!isGenerating && !error && (
                  <Card className="shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200/80 flex flex-col h-full styled-scrollbar">
                    <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                      <div className="bg-pink-50 p-6 rounded-full mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">상세페이지 생성을 시작해주세요</h3>
                      <p className="text-gray-500 max-w-md">
                        왼쪽 폼에 상품 정보를 입력하고 <br/>
                        'AI 상세페이지 생성하기' 버튼을 클릭하세요.
                      </p>
                      <div className="mt-8 text-xs text-gray-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        필수 입력 항목: 상품명, 카테고리, 상품 설명
                      </div>
                    </div>
                  </Card>
                )}
                
                {/* 에러 메시지 */}
                {error && (
                  <Card className="shadow-lg rounded-lg overflow-hidden bg-red-50 border border-red-200 flex flex-col h-full">
                    <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                      <div className="bg-red-100 p-6 rounded-full mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-red-700 mb-3">생성 중 오류가 발생했습니다</h3>
                      <p className="text-red-600 text-center max-w-md">{error}</p>
                      <button 
                        onClick={() => setError(null)}
                        className="mt-6 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
                      >
                        다시 시도하기
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 전체 화면 로딩 오버레이 */}
      {isGenerating && <LoadingOverlay />}
      
      {/* Global Styles */}
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 6px; } .styled-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 8px; } .styled-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 8px; } .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #ccc; }
        .drop-indicator { border-radius: 3px; box-shadow: 0 0 0 2px white; animation: pulse 1.5s infinite; } @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        [id^="section-"].dragging { animation: lifting 0.2s forwards; cursor: grabbing !important; } @keyframes lifting { from { transform: scale(1); box-shadow: var(--tw-shadow); } to { transform: scale(1.01); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); } }
        .highlight-section { background-color: #fff8fb; transition: background-color 0.3s ease-in-out; }
      `}</style>
      <Toaster />
    </>
  );
};
export default AppPage;
