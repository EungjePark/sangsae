import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateProductDetail, countTokens, type ProductDetailContent, type ProductDetailSection, type ProductCategory } from '@/lib/gemini';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, X, Tag, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'katex/dist/katex.min.css';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"

// 브랜드 색상 및 스타일 상수
const BRAND = {
  color: {
    primary: '#ff68b4',
    // ... existing code ...
  },
  // ... existing code ...
};

const AppPage: NextPage = () => {
  // toast 훅 초기화
  const { toast } = useToast();

  // 상품 정보 상태
  const [productName, setProductName] = useState<string>('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('기타');
  const [productDescription, setProductDescription] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [showAdditionalFields, setShowAdditionalFields] = useState<boolean>(false);
  const [shippingInfo, setShippingInfo] = useState<string>('');
  const [returnPolicy, setReturnPolicy] = useState<string>('');
  const [productKeywords, setProductKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [targetCustomers, setTargetCustomers] = useState<string>('');
  
  // 생성된 컨텐츠 상태
  const [generatedContent, setGeneratedContent] = useState<ProductDetailContent | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<Record<string, number>>({});
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  // 섹션 편집 상태 관리 - 컴포넌트 최상위 레벨로 이동
  const [isEditing, setIsEditing] = useState<Record<string, boolean | string>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  
  // 드래그 오버 이벤트 개선
  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    
    // FAQ와 배송 정보 섹션으로는 드래그 불가능하게 설정
    if (sectionId === 'faq' || sectionId === 'shipping_return') {
      return;
    }
    
    if (draggedSection && draggedSection !== sectionId) {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        // 모든 위치 표시기 제거
        document.querySelectorAll('.drop-indicator').forEach(el => {
          el.remove();
        });
        
        // 드롭 가능한 위치 시각적 표시 - 상단 또는 하단에 표시
        const rect = element.getBoundingClientRect();
        const dropMarker = document.createElement('div');
        dropMarker.className = 'drop-indicator absolute left-0 right-0 h-1 z-30 bg-[#ff68b4]';
        
        // 커서 위치에 따라 상단 또는 하단에 표시
        const cursorY = e.clientY;
        const topHalf = cursorY < rect.top + rect.height / 2;
        
        if (topHalf) {
          dropMarker.style.top = '0px';
          dropMarker.style.transform = 'translateY(-50%)';
        } else {
          dropMarker.style.bottom = '0px';
          dropMarker.style.transform = 'translateY(50%)';
        }
        
        element.style.position = 'relative';
        element.appendChild(dropMarker);
      }
    }
  };
  
  // PDF 다운로드 함수
  const handleDownloadPDF = () => {
    // html2pdf가 로드되어 있지 않으면 스크립트 로드
    if (typeof window !== 'undefined' && !window.html2pdf) {
      // html2pdf 라이브러리 동적 로드
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => console.log('html2pdf 라이브러리가 로드되었습니다.');
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
      .filter(section => !hiddenSections.includes(section.id))
      .sort((a, b) => {
        // 커스텀 순서가 있으면 사용, 없으면 기본 순서 사용
        const orderA = sectionOrder[a.id] !== undefined 
          ? sectionOrder[a.id] 
          : getSectionOrder(a.id);
        
        const orderB = sectionOrder[b.id] !== undefined 
          ? sectionOrder[b.id] 
          : getSectionOrder(b.id);
        
        return orderA - orderB;
      })
      .map(section => {
        const sectionContent = section.content.replace(/^\[.*?\]\s*/, '');
        const friendlyContent = sectionContent
          .replace(/입니다\./g, '이에요.')
          .replace(/합니다\./g, '해요.')
          .replace(/됩니다\./g, '돼요.')
          .replace(/있습니다\./g, '있어요.')
          .replace(/습니다\./g, '어요.');
      
        // 섹션 ID에 대한 이모지 가져오기
        const emojiMap: Record<string, string> = {
          'title_block': '✨',
          'hero_section': '👋',
          'main_feature': '💡',
          'sub_features': '🔍',
          'how_to_use': '📝',
          'specifications': '📊',
          'warranty_info': '🛡️',
          'shipping_return': '🚚',
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
          'trust_elements': '🤝',
          'target_customers': '👥',
          'closing_info': '📌'
        };
        
        return {
          title: getKoreanTitle(section.id),
          emoji: emojiMap[section.id] || '✨',
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
    
    const contentHTML = previewContent.map((section, index) => `
      <div style="margin-bottom: 20px; ${index !== 0 ? 'padding-top: 15px; border-top: 1px solid #eee;' : ''}">
        <h2 style="font-size: 18px; color: #333; margin-bottom: 10px; display: flex; align-items: center;">
          <span style="margin-right: 8px; font-size: 20px;">${section.emoji}</span>
          ${section.title}
        </h2>
        <div style="padding-left: 20px; color: #444; font-size: 14px; line-height: 1.5;">
          ${section.content.split('\n').map(p => p ? `<p style="margin-bottom: 8px;">${p}</p>` : '').join('')}
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
      });
  };

  // 섹션 ID를 한글 제목으로 변환하는 함수
  const getKoreanTitle = (sectionId: string): string => {
    const titleMap: Record<string, string> = {
      'title_block': '제품 타이틀',
      'hero_section': '제품 소개',
      'main_feature': '주요 특징',
      'sub_features': '추가 기능',
      'how_to_use': '사용 방법',
      'specifications': '제품 사양',
      'warranty_info': '보증 정보',
      'shipping_return': '배송 및 반품 정보',
      'faq': '자주 묻는 질문',
      'style_guide': '스타일 가이드',
      'material_details': '소재 정보',
      'size_chart': '사이즈 정보',
      'care_instructions': '관리 방법',
      'coordination_suggestions': '코디 제안',
      'ingredients': '성분 정보',
      'effect_description': '제품 효과',
      'recommended_skin_type': '추천 피부타입',
      'safety_features': '안전 기능',
      'age_recommendation': '연령 추천',
      'taste_description': '맛 설명',
      'nutrition_facts': '영양 정보',
      'storage_instructions': '보관 방법',
      'serving_suggestions': '섭취 방법',
      'size_specifications': '크기 정보',
      'installation_guide': '설치 가이드',
      'tech_specifications': '기술 사양',
      'unique_technology': '고유 기술',
      'compatibility_info': '호환성 정보',
      'performance_features': '성능 특징',
      'content_summary': '콘텐츠 요약',
      'author_artist_info': '작가/아티스트 정보',
      'edition_details': '에디션 정보',
      'highlight_features': '주요 특징',
      'creative_possibilities': '활용 방법',
      'full_content': '전체 내용',
      'error': '오류 발생',
      'hook_intro': '도입부',
      'selling_points': '판매 포인트',
      'product_detail': '제품 상세',
      'trust_elements': '신뢰 요소',
      'target_customers': '타겟 고객층',
      'closing_info': '마무리 정보'
    };
    
    return titleMap[sectionId] || sectionId;
  };

  // 섹션의 기본 순서를 반환하는 함수 - 숫자가 작을수록 위에 배치
  const getSectionOrder = (sectionId: string): number => {
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
      'faq': 990, // 자주 묻는 질문은 항상 맨 아래에서 두 번째에 위치 (중요)
      'shipping_return': 1000 // 배송 정보는 항상 맨 아래에 위치 (중요)
    };
    return orderMap[sectionId] || 500; // 매핑되지 않은 섹션은 중간에 배치
  };

  // 섹션 클래스 가져오기 함수
  const getSectionClass = (sectionId: string, isDragged: boolean): string => {
    let className = "mb-6 rounded-lg border border-gray-200 overflow-hidden transition-all";
    
    // 드래그 중인 섹션에 스타일 적용
    if (isDragged) {
      className += " border-[#ff68b4] shadow-lg opacity-90 scale-105 z-50";
    } else {
      className += " bg-white shadow-sm hover:shadow-md";
    }
    
    return className;
  };

  // 카테고리 옵션
  const categoryOptions = [
    { value: '패션의류/잡화', label: '패션의류/잡화' },
    { value: '뷰티', label: '뷰티' },
    { value: '출산/유아동', label: '출산/유아동' },
    { value: '식품', label: '식품' },
    { value: '주방용품', label: '주방용품' },
    { value: '생활용품', label: '생활용품' },
    { value: '홈인테리어', label: '홈인테리어' },
    { value: '가전디지털', label: '가전디지털' },
    { value: '스포츠/레저', label: '스포츠/레저' },
    { value: '자동차용품', label: '자동차용품' },
    { value: '도서/음반/DVD', label: '도서/음반/DVD' },
    { value: '완구/취미', label: '완구/취미' },
    { value: '문구/오피스', label: '문구/오피스' },
    { value: '반려동물용품', label: '반려동물용품' },
    { value: '헬스/건강식품', label: '헬스/건강식품' },
    { value: '기타', label: '기타' }
  ];

  // 드래그 앤 드롭 관련 함수들 개선
  const handleDragStart = (sectionId: string) => {
    // FAQ와 배송 정보는 드래그 불가능하게 설정
    if (sectionId === 'faq' || sectionId === 'shipping_return') {
      return; // 드래그 시작을 중단
    }
    
    setDraggedSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.classList.add('dragging');
    }
  };
  
  const handleDragEnd = () => {
    setDraggedSection(null);
    // 드래그 효과 제거
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    // 모든 위치 표시기 제거
    document.querySelectorAll('.drop-indicator').forEach(el => {
      el.remove();
    });
  };
  
  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    
    // FAQ와 배송 정보 섹션으로는 드롭 불가능
    if (targetSectionId === 'faq' || targetSectionId === 'shipping_return') {
      handleDragEnd();
      return;
    }
    
    if (draggedSection && draggedSection !== targetSectionId) {
      // 섹션 위치 업데이트
      const currentOrder = { ...sectionOrder };
      
      // 드래그된 섹션의 기본 순서가 아닌 현재 할당된 순서를 사용
      const draggedOrder = currentOrder[draggedSection] !== undefined 
        ? currentOrder[draggedSection] 
        : getSectionOrder(draggedSection);
      
      const targetOrder = currentOrder[targetSectionId] !== undefined 
        ? currentOrder[targetSectionId] 
        : getSectionOrder(targetSectionId);
      
      // 모든 위치 표시기 제거
      document.querySelectorAll('.drop-indicator').forEach(el => {
        el.remove();
      });
      
      // 드롭 위치에 따라 재정렬
      const rect = e.currentTarget.getBoundingClientRect();
      const cursorY = e.clientY;
      const isTopHalf = cursorY < rect.top + rect.height / 2;
      
      // 새로운 순서를 저장할 객체
      const newOrders: Record<string, number> = { ...currentOrder };
      
      // FAQ와 배송 정보는 항상 맨 아래에 고정
      Object.keys(newOrders).forEach(sectionId => {
        if (sectionId === 'faq') {
          newOrders[sectionId] = 990;
        } else if (sectionId === 'shipping_return') {
          newOrders[sectionId] = 1000;
        }
      });
      
      // 현재 드래그된 섹션의 새 순서 계산
      if (isTopHalf) {
        // 상단에 위치하도록
        newOrders[draggedSection] = targetOrder - 1;
      } else {
        // 하단에 위치하도록
        newOrders[draggedSection] = targetOrder + 1;
      }
      
      // FAQ와 반품 정보가 항상 맨 아래에 위치하도록 강제 설정
      if (!newOrders['faq']) newOrders['faq'] = 990;
      if (!newOrders['shipping_return']) newOrders['shipping_return'] = 1000;
      
      setSectionOrder(newOrders);
    }
    
    setDraggedSection(null);
  };

  // 섹션 숨기기/표시 관련 함수
  const handleHideSection = (sectionId: string) => {
    setHiddenSections([...hiddenSections, sectionId]);
  };
  
  const handleShowSection = (sectionId: string) => {
    setHiddenSections(hiddenSections.filter(id => id !== sectionId));
  };
  
  // 섹션 편집 관련 함수
  const handleStartEdit = (sectionId: string, content: string) => {
    setIsEditing({ ...isEditing, [sectionId]: true });
    setEditedContent({ ...editedContent, [sectionId]: content });
    
    // 에디터 포커스 및 높이 조정을 위한 timeout
    setTimeout(() => {
      if (textareaRefs.current[sectionId]) {
        textareaRefs.current[sectionId]?.focus();
        // 텍스트 영역의 높이를 내용에 맞게 자동 조정
        textareaRefs.current[sectionId]!.style.height = 'auto';
        textareaRefs.current[sectionId]!.style.height = `${textareaRefs.current[sectionId]!.scrollHeight}px`;
      }
    }, 50);
  };
  
  const handleCancelEdit = (sectionId: string) => {
    const newIsEditing = { ...isEditing };
    delete newIsEditing[sectionId];
    setIsEditing(newIsEditing);
    
    const newEditedContent = { ...editedContent };
    delete newEditedContent[sectionId];
    setEditedContent(newEditedContent);
  };
  
  const handleSaveEdit = (sectionId: string) => {
    if (!generatedContent) return;
    
    // 수정된 내용으로 콘텐츠 업데이트
    const updatedSections = generatedContent.sections.map(section => {
      if (section.id === sectionId) {
        // 기존 ID 태그 유지 (예: [product_name])
        const idTag = section.content.match(/^\[.*?\]\s*/) || [''];
        return {
          ...section,
          content: `${idTag[0]}${editedContent[sectionId]}`
        };
      }
      return section;
    });
    
    setGeneratedContent({
      ...generatedContent,
      sections: updatedSections
    });
    
    const newIsEditing = { ...isEditing };
    delete newIsEditing[sectionId];
    setIsEditing(newIsEditing);
  };
  
  // 기본 입력 필드 스타일 개선을 위한 컴포넌트
  const FormField = ({ 
    label, 
    required = false, 
    children, 
    tip 
  }: { 
    label: string; 
    required?: boolean; 
    children: React.ReactNode; 
    tip?: string;
  }) => (
    <div className="mb-6 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center mb-2">
        <h3 className="font-medium text-base text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
      </div>
      {children}
      {tip && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-700">
          <div className="flex items-start">
            <span className="mr-2 mt-0.5">💡</span>
            <span className="flex-1">{tip}</span>
          </div>
        </div>
      )}
    </div>
  );
  
  // 섹션 재생성 함수 개선
  const handleRegenerateSection = async (sectionId: string) => {
    if (!generatedContent) return;
    
    // 재생성 시작 상태로 설정
    setIsEditing({ ...isEditing, [sectionId]: 'regenerating' });
    
    try {
      // 현재 섹션 정보 가져오기
      const currentSection = generatedContent.sections.find(s => s.id === sectionId);
      if (!currentSection) throw new Error('섹션을 찾을 수 없습니다.');
      
      // API 요청을 위한 데이터 구조화
      const structuredContent: { sections: Record<string, { content: string }> } = {
        sections: {}
      };
      
      // 모든 섹션 데이터를 structuredContent에 추가
      generatedContent.sections.forEach(section => {
        structuredContent.sections[section.id] = {
          content: section.content.replace(/^\[.*?\]\s*/, '') // ID 태그 제거
        };
      });
      
      // 상품 데이터 준비
      const productData = {
        name: productName,
        category: productCategory as ProductCategory,
        price: '', // 가격 정보는 없으므로 빈 문자열로 설정
        description: productDescription,
        additionalInfo: `대상 고객층: ${targetCustomers}\n\n${additionalInfo}`,
        keywords: productKeywords.join(', '),
        shippingInfo: shippingInfo,
        returnPolicy: returnPolicy
      };
      
      console.log('API 요청 데이터:', { sectionId, productData });
      
      // API 호출
      const response = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId,
          productData,
          currentContent: structuredContent
        }),
      });
      
      if (!response.ok) {
        let errorMessage = '섹션 재생성 중 오류가 발생했습니다';
        let errorData;
        
        try {
          // JSON 형식으로 에러 응답 파싱 시도
          errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // JSON이 아닌 경우 텍스트로 처리
          const errorText = await response.text();
          console.error('API 응답 오류:', response.status, errorText);
        }
        
        // API 할당량 초과 확인
        if (response.status === 429) {
          errorMessage = '현재 AI 생성 할당량이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
        }
        
        // 토스트 메시지로 에러 표시
        toast({
          title: "재생성 실패",
          description: errorMessage,
          variant: "destructive",
        });
        
        throw new Error(errorMessage);
      }
      
      // API 응답 처리
      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
      // 응답에서 해당 섹션 내용 추출
      if (data && data.sections && data.sections[sectionId]) {
        // 해당 섹션의 내용만 가져옴
        const newSectionContent = data.sections[sectionId].content;
        
        // 기존 ID 태그 유지를 위한 처리
        let formattedContent = newSectionContent;
        if (!formattedContent.startsWith(`[${sectionId}]`)) {
          formattedContent = `[${sectionId}] ${formattedContent.replace(/^\[.*?\]\s*/, '')}`;
        }
        
        // 해당 섹션만 업데이트
        const updatedSections = generatedContent.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              content: formattedContent
            };
          }
          return section;
        });
        
        // 상태 업데이트
        setGeneratedContent({
          ...generatedContent,
          sections: updatedSections
        });
        
        // 성공 메시지 표시
        toast({
          title: "섹션 재생성 완료",
          description: "새로운 내용이 적용되었습니다",
        });
        
        console.log('섹션 콘텐츠 업데이트 완료:', sectionId);
      } else {
        console.error('응답에 섹션 데이터가 없음:', data);
        toast({
          title: "재생성 실패",
          description: "재생성 결과가 없습니다",
          variant: "destructive",
        });
        throw new Error('재생성 결과가 없습니다');
      }
    } catch (error) {
      console.error('섹션 재생성 중 오류 발생:', error);
      // 이미 토스트로 오류를 표시했으므로 추가 알림은 필요 없음
    } finally {
      // 항상 상태 초기화 (finally 블록에서 처리)
      setIsEditing(prev => {
        const newState = { ...prev };
        delete newState[sectionId];
        return newState;
      });
    }
  };
  
  // 위치 표시기 렌더링 함수
  const renderPositionIndicator = (position: 'top' | 'bottom') => {
    return (
      <div className={`drop-indicator absolute left-0 right-0 h-1 bg-[#ff68b4] ${position === 'top' ? 'top-0 -translate-y-1/2' : 'bottom-0 translate-y-1/2'}`} />
    );
  };
  
  // 프리뷰 모달 생성 함수
  const createPreviewModal = () => {
    if (!generatedContent) return;
    
    // 프리뷰 내용 생성
    const previewContent = generatedContent.sections
      .filter(section => !hiddenSections.includes(section.id))
      .map(section => {
        const sectionContent = section.content.replace(/^\[.*?\]\s*/, '');
        const friendlyContent = sectionContent
          .replace(/입니다\./g, '이에요.')
          .replace(/합니다\./g, '해요.')
          .replace(/됩니다\./g, '돼요.')
          .replace(/있습니다\./g, '있어요.')
          .replace(/습니다\./g, '어요.');
        
        // 섹션 ID에 대한 이모지 가져오기
        const emojiMap: Record<string, string> = {
          'title_block': '✨',
          'hero_section': '👋',
          'main_feature': '💡',
          'sub_features': '🔍',
          'how_to_use': '📝',
          'specifications': '📊',
          'warranty_info': '🛡️',
          'shipping_return': '🚚',
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
          'trust_elements': '🤝',
          'target_customers': '👥',
          'closing_info': '📌'
        };
        
        return {
          title: getKoreanTitle(section.id),
          emoji: emojiMap[section.id] || '✨',
          content: friendlyContent,
          order: sectionOrder[section.id] !== undefined ? sectionOrder[section.id] : getSectionOrder(section.id) || 99
        };
      })
      .sort((a, b) => a.order - b.order);
    
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
            ${productName || '상품명'} 상세페이지 미리보기
          </h2>
          <button id="close-preview" class="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-grow p-6">
          <div class="max-w-3xl mx-auto">
            ${previewContent.map((section, index) => `
              <div class="mb-8 ${index !== 0 ? 'pt-6 border-t border-gray-100' : ''}">
                <h3 class="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <span class="text-xl mr-2">${section.emoji}</span>
                  ${section.title}
                </h3>
                <div class="text-gray-700 whitespace-pre-line pl-2 leading-relaxed">
                  ${section.content.split('\n').map(p => p ? `<p class="mb-2">${p}</p>` : '').join('')}
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

  // addKeyword 수정 (인자 없이 호출될 때를 처리)
  const addKeyword = (keyword: string = '') => {
    const trimmedKeyword = keyword || keywordInput.trim();
    if (trimmedKeyword && productKeywords.length < 10 && !productKeywords.includes(trimmedKeyword)) {
      setProductKeywords([...productKeywords, trimmedKeyword]);
      setKeywordInput('');
    } else if (productKeywords.length >= 10) {
      alert('키워드는 최대 10개까지 추가할 수 있습니다.');
    }
  };

  // 폼 제출 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !productCategory) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    try {
      // gemini.ts에 targetCustomers가 없을 경우를 대비해 필요한 속성만 전달
      const result = await generateProductDetail({
        name: productName,
        category: productCategory as ProductCategory,
        description: productDescription,
        // targetCustomers를 additionalInfo에 포함시켜 전달
        additionalInfo: `대상 고객층: ${targetCustomers}\n\n${additionalInfo}`,
        keywords: productKeywords.join(', '), // string[]을 string으로 변환
        shippingInfo: shippingInfo,
        returnPolicy: returnPolicy
      });
      
      setGeneratedContent(result);
      
      // 생성된 섹션의 순서를 초기화
      const newSectionOrder: Record<string, number> = {};
      result.sections.forEach((section, index) => {
        newSectionOrder[section.id] = getSectionOrder(section.id) || index;
      });
      setSectionOrder(newSectionOrder);
      
    } catch (err: any) {
      setError(err.message || '상세페이지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 키워드 관련 함수
  const [isComposing, setIsComposing] = useState(false);

  const handleKeywordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      addKeyword(value);
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
  };

  const removeKeyword = (keyword: string) => {
    setProductKeywords(productKeywords.filter(k => k !== keyword));
  };

  // 버튼 클릭 이벤트로 키워드 추가하는 함수 - 이벤트 핸들러 버전
  const handleAddKeywordClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    addKeyword();
  };

  // 재생성 버튼 클릭 핸들러
  const handleRegenerate = () => {
    if (!productName || !productCategory) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    // 확인 후 재생성 진행
    if (window.confirm('상세페이지를 새로 생성하시겠습니까? 현재 생성된 내용은 사라집니다.')) {
      setIsGenerating(true);
      setError(null);
      
      // 필수 값 검증 후 생성 진행
      if (!productName || !productCategory) {
        toast({
          title: "입력 오류",
          description: "필수 항목을 모두 입력해주세요",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      // 생성 함수 호출
      generateProductDetail({
        name: productName,
        category: productCategory as ProductCategory,
        description: productDescription,
        additionalInfo: `대상 고객층: ${targetCustomers}\n\n${additionalInfo}`,
        keywords: productKeywords.join(', '),
        shippingInfo: shippingInfo,
        returnPolicy: returnPolicy
      }).then(result => {
        setGeneratedContent(result);
        
        // 생성된 섹션의 순서를 초기화
        const newSectionOrder: Record<string, number> = {};
        result.sections.forEach((section, index) => {
          newSectionOrder[section.id] = getSectionOrder(section.id) || index;
        });
        setSectionOrder(newSectionOrder);
        
        setIsGenerating(false);
        
        toast({
          title: "재생성 완료",
          description: "상세페이지가 새로 생성되었습니다.",
        });
      }).catch(err => {
        setError(err.message || '상세페이지 생성 중 오류가 발생했습니다.');
        setIsGenerating(false);
        
        toast({
          title: "재생성 실패",
          description: err.message || '상세페이지 생성 중 오류가 발생했습니다.',
          variant: "destructive"
        });
      });
    }
  };

  return (
    <>
      <Head>
        <title>상세페이지 생성 도구</title>
        <meta name="description" content="AI를 활용한 상세페이지 생성 도구" />
      </Head>

      <div className="container max-w-7xl mx-auto py-10 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff68b4] to-[#6c5ce7] bg-clip-text text-transparent">상세페이지 생성 도구</h1>
          <p className="text-gray-600">상품 정보를 입력하면 AI가 상세페이지를 자동으로 생성해 드립니다.</p>
          <p className="text-sm mt-2 inline-block px-2.5 py-1 rounded-full bg-gradient-to-r from-[#ffd1e8] to-[#e4e1fc] text-gray-700">✦ 전문가들이 검증한 효과적인 상세페이지 구조를 적용했어요</p>
      </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-6">
              <CardTitle className="text-gray-800 text-xl">상품 정보 입력</CardTitle>
              <CardDescription className="text-gray-500">
                상세페이지를 생성할 상품의 정보를 입력해주세요.
                <span className="block mt-1 text-xs text-[#ff68b4]">* 표시는 필수 입력 항목입니다.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-6">
              {/* 기본 정보 섹션 */}
              <div className="space-y-5">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="inline-block w-1.5 h-4 bg-[#ff68b4] mr-2 rounded-sm"></span>
                  기본 정보
                </h3>
                
                  <div className="space-y-2">
                  <Label htmlFor="productName">
                    제품명 <span className="text-red-500">*</span>
                  </Label>
                    <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="예: 프리미엄 블루투스 무선 이어폰"
                    required
                    />
                  </div>
                
                  <div className="space-y-2">
                  <Label htmlFor="productCategory">
                    카테고리 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={productCategory}
                    onValueChange={(value) => setProductCategory(value as ProductCategory)}
                    required
                  >
                    <SelectTrigger id="productCategory">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                
                  <div className="space-y-2">
                  <Label htmlFor="targetCustomers" className="text-gray-700 font-medium">
                    타겟 고객층/페르소나 <span className="text-[#ff68b4]">*</span>
                  </Label>
                    <Textarea
                    id="targetCustomers"
                    value={targetCustomers}
                    onChange={(e) => setTargetCustomers(e.target.value)}
                    placeholder="제품을 사용할 이상적인 고객층을 자세히 설명해주세요."
                      rows={3}
                    required
                    />
                  <div className="mt-2 p-3 rounded-md bg-gradient-to-r from-[#ffd1e8]/20 to-white border border-[#ffd1e8]/50">
                    <p className="text-xs flex items-start">
                      <span className="text-[#ff68b4] mr-1.5 mt-0.5">💡</span>
                      <span>
                        <span className="font-medium text-gray-700">팁:</span> 타겟 고객의 연령대, 라이프스타일, 고민거리 등을 구체적으로 작성하면 효과적인 상세페이지가 생성됩니다.
                        <br />
                        <span className="mt-1 block text-gray-600 italic">예시: "20-30대 직장인, 출퇴근시 대중교통 이용자, 통화품질과 배터리 지속시간을 중요시하는 분"</span>
                      </span>
                    </p>
                  </div>
                </div>
                
                  <div className="space-y-2">
                  <Label htmlFor="productKeywords" className="text-gray-700 font-medium">
                    제품 키워드 <span className="text-xs text-gray-500">(최대 10개, SEO에 유리)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="productKeywords"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordInputKeyDown}
                      onCompositionEnd={handleCompositionEnd}
                      onBlur={() => {
                        // 입력 필드에서 포커스가 떠날 때 키워드를 추가하고 필드를 비움
                        if (keywordInput.trim()) {
                          addKeyword();
                        }
                      }}
                      placeholder="키워드 입력 후 Enter 또는 추가"
                    />
                  <Button
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={handleAddKeywordClick}
                      disabled={keywordInput.trim() === '' || productKeywords.length >= 10}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                  </Button>
                  </div>
                  
                  {productKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {productKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200">
                          <Tag className="h-3 w-3 mr-1 text-[#ff68b4]" />
                          {keyword}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-4 w-4 rounded-full p-0 hover:bg-gray-300/50"
                            onClick={() => removeKeyword(keyword)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 p-3 rounded-md bg-gradient-to-r from-amber-50/50 to-white border border-amber-100/50">
                    <p className="text-xs flex items-start">
                      <span className="text-amber-500 mr-1.5 mt-0.5">💡</span>
                      <span className="text-gray-600">
                        <span className="font-medium text-gray-700">팁:</span> 검색 노출에 도움이 되는 키워드를 추가하세요. 제품의 기능, 용도, 특징 등을 포함해보세요.
                      </span>
                    </p>
                  </div>
                  </div>
                  
                  <div className="space-y-2">
                  <Label htmlFor="productDescription" className="text-gray-700 font-medium">
                    간단한 제품 설명 <span className="text-[#ff68b4]">*</span>
                  </Label>
                    <Textarea
                    id="productDescription"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="제품에 대한 간단한 설명을 입력해주세요."
                    rows={3}
                    required
                    />
                  <div className="mt-2 p-3 rounded-md bg-gradient-to-r from-green-50/50 to-white border border-green-100/50">
                    <p className="text-xs flex items-start">
                      <span className="text-green-500 mr-1.5 mt-0.5">💡</span>
                      <span className="text-gray-600">
                        <span className="font-medium text-gray-700">팁:</span> 고객이 제품을 통해 얻을 수 있는 핵심 혜택을 중심으로 작성해보세요.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* 배송 및 교환/반품 정보 섹션 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700">배송 및 교환/반품 정보</h3>
                  
                  <div className="space-y-2">
                  <Label htmlFor="shippingInfo" className="text-gray-700 font-medium">
                    배송 정보 <span className="text-[#ff68b4]">*</span>
                  </Label>
                    <Textarea
                    id="shippingInfo"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    placeholder="배송 방법, 기간, 비용 등의 정보를 입력해주세요."
                    rows={2}
                    required
                    />
                  <div className="mt-2 p-3 rounded-md bg-gradient-to-r from-purple-50/50 to-white border border-purple-100/50">
                    <p className="text-xs flex items-start">
                      <span className="text-purple-500 mr-1.5 mt-0.5">💡</span>
                      <span>
                        <span className="font-medium text-gray-700">예시:</span>
                        <span className="text-gray-600 italic block mt-0.5">"주문 후 1-3일 이내 출고 | 무료배송 | 제주/도서산간 추가 배송비 3,000원 | 오후 3시 이전 주문 시 당일 발송"</span>
                      </span>
                    </p>
                  </div>
                  </div>
                  
                  <div className="space-y-2">
                  <Label htmlFor="returnPolicy" className="text-gray-700 font-medium">
                    교환/반품/환불 정책 <span className="text-[#ff68b4]">*</span>
                  </Label>
                    <Textarea
                    id="returnPolicy"
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    placeholder="교환, 반품, 환불에 관한 정책을 입력해주세요."
                    rows={2}
                    required
                    />
                  <div className="mt-2 p-3 rounded-md bg-gradient-to-r from-pink-50/50 to-white border border-pink-100/50">
                    <p className="text-xs flex items-start">
                      <span className="text-pink-500 mr-1.5 mt-0.5">💡</span>
                      <span>
                        <span className="font-medium text-gray-700">예시:</span>
                        <span className="text-gray-600 italic block mt-0.5">"수령 후 7일 이내 교환/반품 가능 | 단순변심 왕복배송비 고객부담 | 제품 하자 시 무료반품 | 미사용 상품에 한해 환불 가능"</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* 추가 정보 섹션 */}
              <Collapsible className="w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-700">추가 정보 (선택사항)</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {showAdditionalFields ? 
                        <ChevronUp className="h-4 w-4 text-slate-500" /> : 
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  </div>
                  
                <CollapsibleContent className="pt-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">
                      제품 특징 및 장점
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="특별히 강조하고 싶은 제품의 특징이나 추가 정보를 입력해주세요."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      💡 팁: 다음과 같은 정보를 포함하면 상세페이지가 더 효과적으로 작성됩니다:
                      <br />- 차별화된 3-5가지 셀링포인트 <br />- 경쟁 제품과의 차별점 <br />- 주요 타겟층 <br />- 품질/신뢰성을 보여주는 정보
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-[#ff68b4]"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  효과적인 상세페이지 구조
                </p>
                <ol className="text-xs text-gray-600 pl-5 space-y-1 list-decimal">
                  <li>시선을 사로잡는 <span className="font-medium text-gray-800">강력한 후킹 메시지</span></li>
                  <li>제품의 <span className="font-medium text-gray-800">핵심 셀링포인트 3-5가지</span> 간결하게 강조</li>
                  <li>제품 스토리와 특징 설명</li>
                  <li>신뢰성을 높이는 요소 (품질 보증, 인증, 후기)</li>
                  <li>구매 결정에 필요한 추가 정보 (FAQ, 배송 정보 등)</li>
                </ol>
                  </div>
                </CardContent>
            <CardFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <Button 
                type="submit" 
                className="w-full bg-[#ff68b4] hover:bg-[#ff4faa] text-white"
                disabled={isGenerating || !!generatedContent} // 첫 생성 후 버튼 비활성화
                onClick={handleSubmit} // 폼 제출 핸들러 추가
              >
                {isGenerating ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>생성 중...</span>
                  </>
                ) : (
                  generatedContent ? '이미 생성됨' : '상세페이지 생성하기'
                )}
              </Button>
            </CardFooter>
          
              </Card>
        
        <Card className="h-full flex flex-col border border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-6">
            <CardTitle className="text-gray-800 text-xl">생성된 상세페이지</CardTitle>
            <CardDescription className="text-gray-500">
              상세페이지 내용을 확인하고 수정해보세요.
              <span className="block mt-2 text-xs text-[#ff68b4]">각 섹션 우측의 '편집' 버튼을 클릭하면 내용을 직접 수정할 수 있어요!</span>
            </CardDescription>
          </CardHeader>
          
          {/* 마케팅 성공 팁 - 상단에 배치 */}
          {generatedContent && (
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/30">
              <div className="rounded-lg p-3 border border-[#ff68b4]/20 bg-[#ff68b4]/5">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff68b4] mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  <h4 className="font-medium text-gray-700">마케팅 성공 팁</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 pl-5 list-disc">
                  <li>핵심 셀링포인트 3-5개는 반드시 강조해주세요</li>
                  <li>구매자가 얻는 이점을 구체적으로 설명하세요</li>
                  <li>실제 사용 이미지를 추가하면 전환율이 30% 상승해요</li>
                  <li>간결하고 읽기 쉬운 문장으로 작성하세요</li>
                  <li>모바일에서 확인하기 좋은 레이아웃을 선택하세요</li>
                </ul>
              </div>
            </div>
          )}
          
          <CardContent className="flex-grow px-6 py-6">
            {generatedContent ? (
              <div className="space-y-6">
                {/* 숨김 처리된 섹션 복원 메뉴 */}
                {hiddenSections.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">숨겨진 섹션</h4>
                    <div className="flex flex-wrap gap-2">
                      {hiddenSections.map(sectionId => (
                        <Button 
                          key={sectionId} 
                          variant="outline" 
                          size="sm" 
                          className="text-xs py-1 h-7 flex items-center bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleShowSection(sectionId)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-[#ff68b4]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          {getKoreanTitle(sectionId)} 복원
                        </Button>
                      ))}
        </div>
                  </div>
                )}
                
                {/* 섹션을 커스텀 순서 또는 기본 순서로 정렬 */}
                {generatedContent.sections
                  .filter(section => !hiddenSections.includes(section.id))
                  .sort((a, b) => {
                    // 커스텀 순서가 있으면 사용, 없으면 기본 순서 사용
                    const orderA = sectionOrder[a.id] !== undefined ? sectionOrder[a.id] : (() => {
                      // 섹션 순서 맵 정의
                      const orderMap: Record<string, number> = {
                        'title_block': 1,
                        'hero_section': 1, 
                        'hook_intro': 1,
                        'main_feature': 2,
                        'selling_points': 2,
                        'sub_features': 2,
                        'how_to_use': 3,
                        'product_detail': 3,
                        'specifications': 3,
                        'target_customers': 4,
                        'trust_elements': 5,
                        'warranty_info': 6,
                        'closing_info': 7,
                        'faq': 8, // 자주 묻는 질문은 항상 맨 아래에서 두 번째에 위치
                        'shipping_return': 9 // 배송 정보는 항상 맨 아래에 위치
                      };
                      return orderMap[a.id] || 99;
                    })();
                    
                    const orderB = sectionOrder[b.id] !== undefined ? sectionOrder[b.id] : (() => {
                      // 섹션 순서 맵 정의
                      const orderMap: Record<string, number> = {
                        'title_block': 1,
                        'hero_section': 1, 
                        'hook_intro': 1,
                        'main_feature': 2,
                        'selling_points': 2,
                        'sub_features': 2,
                        'how_to_use': 3,
                        'product_detail': 3,
                        'specifications': 3,
                        'target_customers': 4,
                        'trust_elements': 5,
                        'warranty_info': 6,
                        'closing_info': 7,
                        'faq': 8, // 자주 묻는 질문은 항상 맨 아래에서 두 번째에 위치
                        'shipping_return': 9 // 배송 정보는 항상 맨 아래에 위치
                      };
                      return orderMap[b.id] || 99;
                    })();
                    
                    return orderA - orderB;
                  })
                  .map((section) => {
                  // 시작 부분 [id] 형태의 섹션 ID 제거
                  const sectionContent = section.content.replace(/^\[.*?\]\s*/, '');
                  
                  // 토스 스타일의 이모티콘 매핑
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
                      'trust_elements': '🤝',
                      'target_customers': '👥',
                      'closing_info': '📌'
                    };
                    
                    return emojiMap[sectionId] || '✨';
                  };
                  
                  // 문장을 더 친근하게 변환
                  const friendlyContent = sectionContent
                    .replace(/입니다\./g, '이에요.')
                    .replace(/합니다\./g, '해요.')
                    .replace(/됩니다\./g, '돼요.')
                    .replace(/있습니다\./g, '있어요.')
                    .replace(/습니다\./g, '어요.');
                  
                  // 섹션 그룹에 따른 배경색 지정
                  const getSectionOrder = (sectionId: string): number => {
                    const orderMap: Record<string, number> = {
                      'title_block': 1,
                      'hero_section': 1, 
                      'hook_intro': 1,
                      'main_feature': 2,
                      'selling_points': 2,
                      'sub_features': 2,
                      'how_to_use': 3,
                      'product_detail': 3,
                      'specifications': 3,
                      'target_customers': 4,
                      'trust_elements': 5,
                      'warranty_info': 6,
                      'closing_info': 7,
                      'faq': 8, // 자주 묻는 질문은 항상 맨 아래에서 두 번째에 위치
                      'shipping_return': 9 // 배송 정보는 항상 맨 아래에 위치
                    };
                    
                    return orderMap[sectionId] || 99;
                  };
                  
                  const getSectionBackground = (sectionId: string): string => {
                    const order = getSectionOrder(sectionId);
                    const bgMap: Record<number, string> = {
                      1: 'from-pink-50 to-slate-50',
                      2: 'from-blue-50 to-slate-50',
                      3: 'from-green-50 to-slate-50',
                      4: 'from-yellow-50 to-slate-50',
                      5: 'from-purple-50 to-slate-50'
                    };
                    
                    return bgMap[order] || 'from-blue-50 to-slate-50';
                  };
                  
                  return (
                    <div 
                      id={`section-${section.id}`}
                      key={section.id} 
                      className={getSectionClass(section.id, draggedSection === section.id)}
                      draggable 
                      onDragStart={() => handleDragStart(section.id)}
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, section.id)}
                    >
                      <div className={`px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white`}>
                        <h3 className="font-medium text-gray-800 flex items-center">
                          <button 
                            className="mr-2 p-1.5 rounded-md bg-gray-50 border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-grab active:cursor-grabbing transition-colors group"
                            title="섹션 위치 이동 (드래그하여 원하는 위치로 이동)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#ff68b4]">
                              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
                              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
                            </svg>
                          </button>
                          <span className="mr-2 text-xl flex-shrink-0" style={{color: section.id === 'target_customers' ? BRAND.color.primary : ''}}>{getEmoji(section.id)}</span>
                          <span>{getKoreanTitle(section.id)}</span>
                        </h3>
                        <div className="flex gap-1">
                          {isEditing[section.id] === true ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleCancelEdit(section.id)}
                                className="text-xs py-1 h-8 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                              >
                                취소
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveEdit(section.id)}
                                className="text-xs py-1 h-8 bg-gray-800 hover:bg-gray-900 text-white"
                              >
                                저장
                              </Button>
                            </>
                          ) : isEditing[section.id] === 'regenerating' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs py-1 h-8 border-gray-200"
                              disabled
                            >
                              <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-1"></div>
                              재생성 중
                            </Button>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleStartEdit(section.id, friendlyContent)}
                                className="text-xs py-1 h-8 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                편집
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRegenerateSection(section.id)}
                                className="text-xs py-1 h-8 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                AI 재생성
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleHideSection(section.id)}
                                className="text-xs py-1 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-5 whitespace-pre-wrap text-slate-700 leading-relaxed bg-gray-50/50">
                        {isEditing[section.id] === true ? (
                          <Textarea
                            ref={(el: HTMLTextAreaElement | null) => { textareaRefs.current[section.id] = el; }}
                            value={editedContent[section.id] || friendlyContent}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, [section.id]: e.target.value }))}
                            className="min-h-[150px] resize-y font-inherit"
                          />
                        ) : (
                          <div className="prose prose-slate max-w-none">
                            {friendlyContent.length > 300 ? (
                              <>
                                <div className="max-h-[200px] overflow-y-auto mb-2 pr-2 styled-scrollbar">
                                  {friendlyContent.split('\n').map((paragraph, idx) => (
                                    paragraph.trim() ? 
                                      <p key={idx} className="my-2 leading-relaxed text-[15px] text-gray-700">
                                        {paragraph.length > 100 ? 
                                          paragraph.split('. ').slice(0, 3).map((sentence, sIdx) => (
                                            sentence.trim() ? 
                                              <span key={sIdx} className="inline-block mb-1">{sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'} </span> : 
                                              null
                                          )) : 
                                          paragraph
                                        }
                                        {paragraph.length > 100 && paragraph.split('. ').length > 3 && 
                                          <span className="text-[#ff68b4] hover:text-[#d4357b] cursor-pointer ml-1">... 더보기</span>}
                                      </p> : 
                                      <br key={idx} />
                                  ))}
                                </div>
                              </>
                            ) : (
                              friendlyContent.split('\n').map((paragraph, idx) => (
                                paragraph.trim() ? 
                                  <p key={idx} className="my-2 leading-relaxed text-[15px] text-gray-700">
                                    {paragraph.length > 100 ? 
                                      paragraph.split('. ').map((sentence, sIdx) => (
                                        sentence.trim() ? 
                                          <span key={sIdx} className="inline-block mb-1">{sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'} </span> : 
                                          null
                                      )) : 
                                      paragraph
                                    }
                                  </p> : 
                                  <br key={idx} />
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                {error ? (
                  <div className="text-center text-red-500">
                    <p className="text-xl mb-2">⚠️ 이런, 문제가 생겼어요</p>
                    <p>{error}</p>
                  </div>
                ) : isGenerating ? (
                  <div className="text-center py-10 flex flex-col justify-between min-h-[400px]">
                    <div></div>
                    <div>
                      <div className="mb-6 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="text-[#ff68b4] text-xl">✨</div>
                        </div>
                        <div className="animate-pulse flex space-x-2 justify-center items-center">
                          <div className="h-2.5 w-2.5 bg-[#ffd1e8] rounded-full animate-bounce"></div>
                          <div className="h-2.5 w-2.5 bg-[#ff68b4] rounded-full animate-bounce delay-75"></div>
                          <div className="h-2.5 w-2.5 bg-[#d4357b] rounded-full animate-bounce delay-150"></div>
                          <div className="h-2.5 w-2.5 bg-[#ff68b4] rounded-full animate-bounce delay-300"></div>
                          <div className="h-2.5 w-2.5 bg-[#d4357b] rounded-full animate-bounce delay-150"></div>
                          <div className="h-2.5 w-2.5 bg-[#ff68b4] rounded-full animate-bounce delay-75"></div>
                          <div className="h-2.5 w-2.5 bg-[#ffd1e8] rounded-full animate-bounce"></div>
                        </div>
                        <div className="mt-4">
                          <div className="animate-spin relative mx-auto w-12 h-12 rounded-full">
                            <div className="absolute inset-0 rounded-full border-t-2 border-[#ff68b4] border-opacity-75"></div>
                            <div className="absolute inset-0 rounded-full border-b-2 border-[#ffd1e8] border-opacity-50"></div>
                            <div className="absolute inset-0 rounded-full border-l-2 border-transparent"></div>
                            <div className="absolute inset-0 rounded-full border-r-2 border-transparent"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-lg font-medium mt-4 animate-pulse text-[#ff68b4]">
                        AI가 놀라운 상세페이지를 만들고 있어요
                      </p>
                      <div className="mt-3 text-sm text-gray-600 flex flex-col items-center justify-center space-y-2">
                        <p className="animate-pulse">창의적인 아이디어를 더하는 중이에요...</p>
                        <p className="animate-pulse delay-700">키워드를 분석하고 있어요...</p>
                        <p className="animate-pulse delay-1000">잠시만 기다려주세요 ⏳</p>
                      </div>
                    </div>
                    <div></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xl mb-2 text-gray-700">👈 왼쪽에 상품 정보를 채워주세요</p>
                    <p className="text-sm text-gray-500">입력한 내용을 바탕으로 멋진 상세페이지를 만들어 드릴게요!</p>
                  </div>
                )}
                </div>
              )}
            </CardContent>
          <CardFooter className="flex flex-col space-y-3 pt-6 border-t border-gray-100 bg-gray-50/50 mt-auto px-6 py-4">
            {generatedContent ? (
              <>
                <div className="flex w-full gap-2 justify-center">
                  <Button
                    className="flex items-center gap-1 px-6 bg-gray-800 hover:bg-gray-900 text-white"
                    onClick={() => {
                      const text = generatedContent.sections.map(section => {
                        const sectionContent = section.content.replace(/^\[.*?\]\s*/, '');
                        const friendlyContent = sectionContent
                          .replace(/입니다\./g, '이에요.')
                          .replace(/합니다\./g, '해요.')
                          .replace(/됩니다\./g, '돼요.')
                          .replace(/있습니다\./g, '있어요.')
                          .replace(/습니다\./g, '어요.');
                        return `${getKoreanTitle(section.id)}\n${friendlyContent}\n\n`;
                      }).join('');
                      navigator.clipboard.writeText(text);
                      alert('클립보드에 복사했어요!');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    전체 복사하기
                  </Button>
                 
                  <Button
                    className="flex items-center gap-1 px-6 bg-gray-800 hover:bg-gray-900 text-white"
                    onClick={handleDownloadPDF}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M8 21h8"/><path d="M20 16.2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8.2"/>
                    </svg>
                    PDF 다운로드
                  </Button>
                 
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 text-gray-700 border-gray-200 hover:bg-gray-50"
                    onClick={createPreviewModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    프리뷰
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 text-gray-700 border-gray-200 hover:bg-gray-50"
                    onClick={handleRegenerate}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    재생성하기
                  </Button>
                </div>
                
                {/* 마케팅 팁 컴포넌트는 상단으로 이동했으므로 여기서는 제거 */}
              </>
            ) : null}
          </CardFooter>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
        
        /* 드래그 앤 드롭 관련 스타일 */
        .drop-indicator {
          border-radius: 3px;
          box-shadow: 0 0 0 2px white;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.6;
            width: 100%;
          }
          50% {
            opacity: 1;
            width: 100%;
          }
          100% {
            opacity: 0.6;
            width: 100%;
          }
        }
        
        /* 드래그 중인 요소 스타일 */
        [id^="section-"].dragging {
          animation: lifting 0.2s forwards;
          cursor: grabbing !important;
        }
        
        @keyframes lifting {
          from {
            transform: scale(1);
            box-shadow: var(--tw-shadow);
          }
          to {
            transform: scale(1.01);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        }
      `}</style>
      
      {/* Toaster 컴포넌트 추가 */}
      <Toaster />
    </>
  );
};

export default AppPage;
