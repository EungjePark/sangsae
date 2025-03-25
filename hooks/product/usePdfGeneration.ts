import { useToast } from "@/hooks/use-toast";

interface PDFGeneratorOptions {
  getKoreanTitle: (sectionId: string) => string;
  makeContentFriendly: (content: string) => string;
}

export function usePdfGeneration({ getKoreanTitle, makeContentFriendly }: PDFGeneratorOptions) {
  const { toast } = useToast();

  // 섹션 ID에 대한 이모지 가져오기
  const getEmoji = (sectionId: string): string => {
    const emojiMap: Record<string, string> = {
      'title_block': '✨',
      'hero_section': '👋',
      'main_feature': '💡',
      'sub_features': '🔍',
      'how_to_use': '📝',
      'specifications': '📊',
      'warranty_info': '🛡️',
      'shipping_return': '🚚',
      'shipping_returns': '🚚',
      'faq': '❓',
      'style_guide': '👔',
      'material_details': '🧵',
      'size_chart': '📏',
      'care_instructions': '🧼',
      'coordination_suggestions': '👚',
      'ingredients': '🧪',
      'effect_description': '✨',
      'recommended_skin_type': '👩‍🦰',
      'safety_features': '🔒',
      'age_recommendation': '👶',
      'taste_description': '😋',
      'nutrition_facts': '🥗',
      'storage_instructions': '🧊',
      'serving_suggestions': '🍽️',
      'size_specifications': '📐',
      'installation_guide': '🔧',
      'tech_specifications': '⚙️',
      'unique_technology': '🔬',
      'compatibility_info': '🔄',
      'performance_features': '⚡',
      'content_summary': '📑',
      'author_artist_info': '🎨',
      'edition_details': '📚',
      'highlight_features': '🌟',
      'creative_possibilities': '💭',
      'full_content': '📖',
      'error': '⚠️',
      'hook_intro': '🎯',
      'selling_points': '⭐',
      'product_detail': '📋',
      'product_info': '📋',
      'trust_elements': '🤝',
      'target_customers': '👥',
      'closing_info': '📌',
      'benefits': '✅',
      'material_care': '🧵',
      'size_fit': '📏',
      'usage_scenarios': '🎬',
      'review_highlights': '⭐',
      'purchase_benefits': '🎁'
    };
    
    return emojiMap[sectionId] || '✨';
  };

  // PDF 다운로드 함수
  const handleDownloadPDF = (generatedContent: any, productName: string, productCategory: string, hiddenSections: string[], sectionOrder: Record<string, number>) => {
    // html2pdf가 로드되어 있지 않으면 스크립트 로드
    if (typeof window !== 'undefined' && !window.html2pdf) {
      // html2pdf 라이브러리 동적 로드
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        console.log('html2pdf 라이브러리가 로드되었습니다.');
        generatePDF(generatedContent, productName, productCategory, hiddenSections, sectionOrder);
      };
      script.onerror = () => {
        console.error("html2pdf 라이브러리 로드에 실패했습니다.");
        toast({
          title: "PDF 생성 실패",
          description: "PDF 라이브러리 로드에 실패했습니다. 네트워크 연결을 확인해 주세요.",
          variant: "destructive"
        });
      };
      document.body.appendChild(script);
      return;
    }
    
    // html2pdf가 로드되었는지 확인
    if (!window.html2pdf) {
      console.error("html2pdf 라이브러리가 로드되지 않았습니다.");
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성에 필요한 라이브러리가 로드되지 않았습니다. 페이지를 새로고침 후 다시 시도해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    generatePDF(generatedContent, productName, productCategory, hiddenSections, sectionOrder);
  };

  // PDF 생성 함수
  const generatePDF = (generatedContent: any, productName: string, productCategory: string, hiddenSections: string[], sectionOrder: Record<string, number>) => {
    if (!generatedContent || typeof window === 'undefined') {
      toast({
        title: "PDF 생성 실패",
        description: "PDF를 생성할 수 없습니다. 페이지를 새로고침하거나 다시 시도해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 프리뷰와 유사한 HTML 생성
    const previewContent = generatedContent.sections
      .filter((section: any) => !hiddenSections.includes(section.id))
      .sort((a: any, b: any) => {
        // 커스텀 순서가 있으면 사용, 없으면 기본 순서 사용
        const getSectionOrderFn = (id: string) => {
          const orderMap: Record<string, number> = {
            'title_block': 10,
            'hero_section': 20, 
            'hook_intro': 30,
            'main_feature': 40,
            'selling_points': 50,
            'sub_features': 60,
            'how_to_use': 70,
            'product_detail': 80,
            'specifications': 90,
            'target_customers': 100,
            'trust_elements': 110,
            'warranty_info': 120,
            'closing_info': 130,
            'faq': 990,
            'shipping_return': 1000,
            'shipping_returns': 1000
          };
          return orderMap[id] || 500; 
        };
        
        const orderA = sectionOrder[a.id] !== undefined 
          ? sectionOrder[a.id] 
          : getSectionOrderFn(a.id);
        
        const orderB = sectionOrder[b.id] !== undefined 
          ? sectionOrder[b.id] 
          : getSectionOrderFn(b.id);
        
        return orderA - orderB;
      })
      .map((section: any) => {
        // 시작 부분 [id] 태그 제거
        const sectionContent = section.content.replace(/^\[.*?\]\s*/, '');
        // 친근한 문체로 변환
        const friendlyContent = makeContentFriendly(sectionContent);
        
        return {
          title: getKoreanTitle(section.id),
          emoji: getEmoji(section.id),
          content: friendlyContent
        };
      });
    
    // PDF용 HTML 생성
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-container';
    pdfContainer.style.width = '210mm'; // A4 가로 크기
    pdfContainer.style.padding = '15mm';
    pdfContainer.style.fontFamily = 'sans-serif';
    pdfContainer.style.backgroundColor = 'white';
    pdfContainer.style.color = 'black';
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    
    const titleHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #ff68b4; font-size: 24px; margin-bottom: 10px;">${productName || '상품명'} 상세페이지</h1>
        <p style="color: #666; font-size: 14px;">카테고리: ${productCategory}</p>
      </div>
    `;
    
    const contentHTML = previewContent.map((section: any, index: number) => `
      <div style="margin-bottom: 20px; ${index !== 0 ? 'padding-top: 15px; border-top: 1px solid #eee;' : ''}">
        <h2 style="font-size: 18px; color: #333; margin-bottom: 10px; display: flex; align-items: center;">
          <span style="margin-right: 8px; font-size: 20px;">${section.emoji}</span>
          ${section.title}
        </h2>
        <div style="padding-left: 20px; color: #444; font-size: 14px; line-height: 1.5;">
          ${section.content.split('\n').map((p: string) => p ? `<p style="margin-bottom: 8px;">${p}</p>` : '').join('')}
        </div>
      </div>
    `).join('');
    
    const footerHTML = `
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} 상세페이지 생성 도구에서 생성됨
      </div>
    `;
    
    pdfContainer.innerHTML = titleHTML + contentHTML + footerHTML;
    document.body.appendChild(pdfContainer);
    
    // PDF 생성 진행 알림
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.padding = '20px';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.borderRadius = '10px';
    notification.style.zIndex = '10000';
    notification.innerText = 'PDF를 생성 중입니다. 잠시만 기다려 주세요...';
    document.body.appendChild(notification);
    
    // PDF 옵션 설정
    const options = {
      margin: [10, 10, 10, 10],
      filename: `${productName || '상품'}_상세페이지.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // PDF 생성 및 다운로드
    window.html2pdf().from(pdfContainer).set(options).save()
      .then(() => {
        // 생성 후 임시 컨테이너와 알림 제거
        document.body.removeChild(pdfContainer);
        document.body.removeChild(notification);

        toast({
          title: "PDF 생성 완료",
          description: "PDF가 성공적으로 생성되었습니다.",
        });
      })
      .catch((error: any) => {
        console.error('PDF 생성 오류:', error);
        document.body.removeChild(notification);
        notification.innerText = 'PDF 생성 중 오류가 발생했습니다.';
        notification.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);

        toast({
          title: "PDF 생성 실패",
          description: "PDF 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      });
  };

  // 프리뷰 생성 함수
  const createPreviewModal = (generatedContent: any, hiddenSections: string[], sectionOrder: Record<string, number>) => {
    if (!generatedContent) return;
    
    // 프리뷰 내용 생성
    const previewContent = generatedContent.sections
      .filter((section: any) => !hiddenSections.includes(section.id))
      .sort((a: any, b: any) => {
        const getSectionOrderFn = (id: string) => {
          const orderMap: Record<string, number> = {
            'title_block': 10,
            'hero_section': 20, 
            'hook_intro': 30,
            'main_feature': 40,
            'selling_points': 50,
            'sub_features': 60,
            'how_to_use': 70,
            'product_detail': 80,
            'specifications': 90,
            'target_customers': 100,
            'trust_elements': 110,
            'warranty_info': 120,
            'closing_info': 130,
            'faq': 990,
            'shipping_return': 1000,
            'shipping_returns': 1000
          };
          return orderMap[id] || 500; 
        };
        
        const orderA = sectionOrder[a.id] !== undefined 
          ? sectionOrder[a.id] 
          : getSectionOrderFn(a.id);
        
        const orderB = sectionOrder[b.id] !== undefined 
          ? sectionOrder[b.id] 
          : getSectionOrderFn(b.id);
        
        return orderA - orderB;
      })
      .map((section: any) => {
        const sectionContent = section.content.replace(/^\[.*?\]\s*/, '');
        const friendlyContent = makeContentFriendly(sectionContent);
        
        return {
          title: getKoreanTitle(section.id),
          emoji: getEmoji(section.id),
          content: friendlyContent,
          order: sectionOrder[section.id] !== undefined ? sectionOrder[section.id] : 99
        };
      });
    
    // 모달 생성
    const previewModal = document.createElement('div');
    previewModal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';
    previewModal.id = 'preview-modal';
    
    // 모달 내용
    previewModal.innerHTML = `
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <span class="text-[#ff68b4] mr-2">👁️</span> 
            ${generatedContent.productName || '상품명'} 상세페이지 미리보기
          </h2>
          <button id="close-preview" class="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-grow p-6">
          <div class="max-w-3xl mx-auto">
            ${previewContent.map((section: any, index: number) => `
              <div class="mb-8 ${index !== 0 ? 'pt-6 border-t border-gray-100' : ''}">
                <h3 class="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <span class="text-xl mr-2">${section.emoji}</span>
                  ${section.title}
                </h3>
                <div class="text-gray-700 whitespace-pre-line pl-2 leading-relaxed">
                  ${section.content.split('\n').map((p: string) => p ? `<p class="mb-2">${p}</p>` : '').join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(previewModal);
    
    // 닫기 버튼 이벤트
    document.getElementById('close-preview')?.addEventListener('click', () => {
      document.body.removeChild(previewModal);
    });
    
    // 모달 외부 클릭 시 닫기
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) {
        document.body.removeChild(previewModal);
      }
    });
  };

  return {
    handleDownloadPDF,
    createPreviewModal
  };
} 