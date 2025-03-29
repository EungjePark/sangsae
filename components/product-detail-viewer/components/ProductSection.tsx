import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming path
import { X, Loader2, Edit, RefreshCw, Save, XCircle } from 'lucide-react'; // Import necessary icons
import { getSectionClass, getEmoji } from '../utils/sectionHelpers';
import { getKoreanTitle } from '@/lib/sections/section-manager'; // Assuming path
import { renderSection } from '../utils/renderHelpers';
// import { cleanupColons } from '../utils/contentFormatters'; // Cleanup is done in the hook before passing down
import { type ProductDetailSection, type ProductCategory } from '@/types/product'; // Assuming path
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ProductSectionProps {
  section: ProductDetailSection;
  isEditing: boolean | 'regenerating'; // Allow 'regenerating' state
  editedContent?: string; // Content being edited
  textareaRef: (ref: HTMLTextAreaElement | null) => void; // Ref for the textarea
  targetCustomers: string;
  productCategory: ProductCategory; // Use the specific type
  draggedSection: string | null; // ID of the section being dragged
  // Event Handlers
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void; // Added drag leave
  onDrop: (e: React.DragEvent) => void;
  onHide: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (content: string) => void; // Handler for textarea changes
  onRegenerate: () => void;
  isFAQ?: boolean; // FAQ 섹션 여부
}

// FAQ 콘텐츠를 Q&A 구조로 파싱하는 함수
const parseFAQContent = (content: string): {question: string; answer: string}[] => {
  const faqItems: {question: string; answer: string}[] = [];
  
  // Q:와 A: 패턴을 찾아 질문과 답변 쌍을 추출
  const regex = /Q:\s*([^\r\n]+)(?:\r?\n|\r)A:\s*([^\r\n](?:.|\r|\n)*?)(?=Q:|$)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      faqItems.push({
        question: match[1].trim(),
        answer: match[2].trim()
      });
    }
  }
  
  return faqItems;
};

// 핵심 기능 섹션을 파싱하는 함수
const parseFeatureContent = (content: string): string => {
  // 불필요한 줄바꿈 제거 및 단락 나누기
  const paragraphs = content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  
  // HTML로 포맷팅된 컨텐츠 반환
  return paragraphs.join('</p><p>');
};

// 섹션 ID 유형 정의
enum SectionType {
  FAQ = 'faq',
  CORE_FEATURES = 'core_features',
  BENEFITS = 'benefits',
  MAIN_FEATURE = 'main_feature',
  SUB_FEATURES = 'sub_features',
  HIGHLIGHT_FEATURES = 'highlight_features',
  PRODUCT_INFO = 'product_info'
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  section,
  isEditing,
  editedContent,
  textareaRef,
  targetCustomers,
  productCategory,
  draggedSection,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onHide,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
  onRegenerate,
  isFAQ = false
}) => {

  // Adjust textarea height dynamically
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onEditChange(e.target.value);
    e.target.style.height = 'auto'; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set to scroll height
  };

  // 섹션 타입 결정 함수
  const getSectionType = (sectionId: string): SectionType | null => {
    if (sectionId === 'faq') return SectionType.FAQ;
    if (['core_features', 'highlight_features', 'main_feature', 'sub_features'].includes(sectionId)) {
      return SectionType.CORE_FEATURES;
    }
    if (sectionId === 'benefits') return SectionType.BENEFITS;
    if (sectionId === 'product_info') return SectionType.PRODUCT_INFO;
    return null;
  };

  // 현재 섹션 타입 확인
  const currentSectionType = getSectionType(section.id);

  // FAQ 콘텐츠를 특별하게 렌더링하는 함수
  const renderFAQContent = (content: string) => {
    const faqItems = parseFAQContent(content);
    
    if (faqItems.length === 0) {
      // 파싱된 항목이 없으면 일반 텍스트로 표시
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
    
    return (
      <div className="space-y-6">
        {faqItems.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100/60 transition-all hover:shadow-md">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 bg-gradient-to-r from-[#fff8fb] to-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#ff68b4] text-white font-medium shadow-sm">
                    Q
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 leading-relaxed pr-8">{item.question}</h3>
                </div>
                <div>
                  <svg 
                    className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="p-5 bg-white border-t border-gray-100/80">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[#ff68b4] font-medium">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>
    );
  };

  // 핵심 기능 및 특징 섹션 렌더링 함수
  const renderFeatureContent = (content: string) => {
    // 기능 포인트를 찾아 강조
    const highlightFeatures = (text: string) => {
      // 목록 항목 감지 및 변환 (숫자, 대시, 별표 등으로 시작하는 항목)
      let processedText = text.replace(/^(\d+\.|\-|\*)\s+(.+)$/gm, (match, marker, item) => {
        return `<li class="relative pl-8 py-2">
          <span class="absolute left-0 top-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#fff8fb] text-[#ff68b4] text-sm font-medium">${marker === '*' || marker === '-' ? '•' : marker}</span>
          <span>${item}</span>
        </li>`;
      });
      
      // 목록 그룹화 - 's' 플래그 없이 동작하도록 수정
      processedText = processedText.replace(/<li class="relative pl-8 py-2">[^]*?<\/li>(?=(\s*<li class="relative pl-8 py-2">|$))/g, (match) => {
        return `<ul class="my-4 space-y-1 border-l-2 border-[#fff1f8] pl-2">${match}</ul>`;
      });
      
      // 콜론 기반 항목 강조 (앞서 처리되지 않은 항목)
      processedText = processedText.replace(/^(.*?):\s*(.*)$/gm, (match, label, desc) => {
        // 이미 <li> 태그가 포함된 경우 건너뛰기
        if (match.includes('<li') || match.includes('<ul')) return match;
        
        if (label && desc) {
          return `<div class="my-4 px-4 py-4 rounded-xl bg-white border border-pink-100/60 shadow-sm hover:shadow-md transition-all duration-200">
                    <div class="flex flex-col gap-1">
                      <span class="text-[#ff68b4] font-medium text-sm">${label}</span>
                      <span class="text-gray-800 font-normal">${desc}</span>
                    </div>
                  </div>`;
        }
        return match;
      });
      
      // 단락 처리 (이미 태그로 감싸져 있지 않은 경우에만)
      processedText = processedText.replace(/^([^<].*[^>])$/gm, (match) => {
        if (!match.trim()) return match; // 빈 줄 무시
        return `<p class="my-3 text-gray-700 leading-relaxed">${match}</p>`;
      });
      
      return processedText;
    };

    // 내용 정리 (여러 줄바꿈 통합, 특수 문자 처리 등)
    const cleanContent = content
      .replace(/\n{3,}/g, '\n\n') // 3줄 이상의 줄바꿈을 2줄로 통일
      .trim();
    
    // 일반 텍스트를 HTML로 변환
    const formattedContent = highlightFeatures(cleanContent);
    
    return (
      <div className="feature-content">
        <div 
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
        <style jsx global>{`
          .feature-content ul {
            list-style-type: none;
            padding-left: 0;
          }
          .feature-content p {
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
            color: #374151;
            font-size: 0.95rem;
          }
          .feature-content li {
            transition: transform 0.2s ease;
          }
          .feature-content li:hover {
            transform: translateX(2px);
          }
        `}</style>
      </div>
    );
  };

  // 혜택/이점 섹션 렌더링 함수 
  const renderBenefitsContent = (content: string) => {
    // 각 혜택을 카드 형태로 표시하기 위한 처리
    const splitBenefits = content.split(/\n{2,}/);
    
    return (
      <div className="benefits-grid grid grid-cols-1 gap-5">
        {splitBenefits.map((benefit, index) => {
          // 콜론이 있는 경우 제목과 내용 분리 ('s' 플래그 대신 [^] 패턴 사용)
          const hasTitleContent = benefit.match(/^([^:]+):\s*([^]*)/);
          
          if (hasTitleContent) {
            const [_, title, description] = hasTitleContent;
            return (
              <div 
                key={index} 
                className="benefit-card relative p-5 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden 
                          transition-all duration-300 hover:shadow-md hover:border-pink-100 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h4 className="text-base text-[#ff68b4] font-medium mb-2 flex items-center">
                    <span className="inline-block w-2 h-2 bg-[#ff68b4] rounded-full mr-2"></span>
                    {title.trim()}
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{description.trim()}</p>
                </div>
              </div>
            );
          }
          
          // 일반 텍스트는 심플한 카드로 표시
          return (
            <div 
              key={index} 
              className="benefit-card relative p-5 rounded-2xl bg-gradient-to-r from-[#fff8fb]/50 to-white border border-pink-50 
                        transition-all duration-300 hover:shadow-md hover:from-[#fff8fb] group"
            >
              <div className="relative z-10">
                <p className="text-gray-700 text-sm leading-relaxed">{benefit.trim()}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // 제품 정보 섹션 렌더링 함수
  const renderProductInfoContent = (content: string) => {
    // 정보 항목을 구분해서 테이블 형태로 표현
    const infoRows = content.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(/:\s+|：\s*/);
        if (parts.length >= 2) {
          return {
            label: parts[0].trim(),
            value: parts.slice(1).join(': ').trim()
          };
        }
        return { label: '', value: line.trim() };
      });
    
    return (
      <div className="info-table space-y-0 rounded-xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-100 bg-white">
        {infoRows.map((row, index) => (
          row.label ? (
            <div 
              key={index} 
              className="flex info-row transition-colors hover:bg-gray-50"
            >
              <div className="w-1/3 font-medium text-gray-500 p-3 text-sm bg-gray-50/50">{row.label}</div>
              <div className="w-2/3 text-gray-800 p-3 text-sm">{row.value}</div>
            </div>
          ) : (
            <div key={index} className="py-3 px-3 text-gray-800 text-sm hover:bg-gray-50 transition-colors">{row.value}</div>
          )
        ))}
        <style jsx global>{`
          .info-table {
            border-collapse: separate;
            border-spacing: 0;
          }
          .info-row:last-child > div {
            border-bottom: none;
          }
        `}</style>
      </div>
    );
  };

  // 섹션 내용 렌더링 함수
  const renderSectionContent = () => {
    if (!section.content) {
      return <p className="text-gray-500 italic text-sm">이 섹션에 내용이 없습니다.</p>;
    }

    // 특수 섹션 처리
    if (isFAQ || section.id === 'faq') {
      return renderFAQContent(section.content);
    }

    // 섹션 유형별 렌더링
    switch (currentSectionType) {
      case SectionType.CORE_FEATURES:
      case SectionType.MAIN_FEATURE:
      case SectionType.SUB_FEATURES:
      case SectionType.HIGHLIGHT_FEATURES:
        return renderFeatureContent(section.content);
      case SectionType.BENEFITS:
        return renderBenefitsContent(section.content);
      case SectionType.PRODUCT_INFO:
        return renderProductInfoContent(section.content);
      default:
        // 일반 마크다운 콘텐츠 처리
        // 수정된 renderSection 함수에 맞게 인자 2개만 전달
        return renderSection(section, targetCustomers, productCategory);
    }
  };

  return (
    <Card
      id={`section-${section.id}`}
      className={getSectionClass(section.id, draggedSection === section.id)}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* 섹션 헤더 - 섹션 ID 대신 한글 제목 표시 */}
      <CardHeader className="p-4 flex items-center justify-between bg-gradient-to-r from-[#fff1f8] to-white border-b border-pink-100">
        <div className="flex items-center">
          <span className="text-[#ff68b4] mr-2 text-xl">{getEmoji(section.id)}</span>
          <h3 className="font-semibold text-gray-800 hover:text-[#ff68b4] transition-colors">
            {getKoreanTitle(section.id) || section.title || "섹션 제목 없음"}
          </h3>
        </div>
      </CardHeader>

      {/* 콘텐츠 영역 */}
      <CardContent className="p-5 pt-4 bg-white">
        {isEditing === true ? (
          // 편집 모드
          <div className="mt-1">
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={handleTextareaInput}
              className="w-full min-h-[150px] p-3 text-sm border rounded-md border-gray-300 focus:border-[#ff68b4] focus:ring focus:ring-[#ff68b4]/20 transition-all"
              placeholder="여기에 내용을 작성하세요..."
            ></textarea>
            
            {/* 기존 편집 버튼 영역 */}
            <div className="flex space-x-2 mt-3 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                className="text-xs h-7 px-2 text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200"
              >
                <XCircle className="h-3 w-3 mr-1"/> 취소
              </Button>
              <Button
                size="sm"
                onClick={onSaveEdit}
                className="text-xs h-7 px-2 bg-[#ff68b4] hover:bg-[#ff45a8] text-white"
              >
                <Save className="h-3 w-3 mr-1"/> 저장
              </Button>
            </div>
          </div>
        ) : isEditing === 'regenerating' ? (
          // 재생성 모드
          <div className="mt-1 py-6 flex items-center justify-center text-center">
            <Loader2 className="h-5 w-5 text-[#ff68b4] animate-spin mr-2" />
            <span className="text-gray-600 text-sm">AI가 새로운 내용을 만들고 있어요...</span>
          </div>
        ) : (
          // 조회 모드
          <>
            {/* 개선된 섹션 내용 렌더링 - 마크다운 지원 */}
            <div className="mt-1 prose prose-sm max-w-none prose-pink">
              {renderSectionContent()}
            </div>
            
            {/* 기존 액션 버튼 영역 */}
            <div className="flex mt-4 pt-3 space-x-2 border-t border-gray-100 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-600 hover:text-[#ff68b4] hover:bg-[#fff8fb]"
                onClick={onStartEdit}
                title="이 섹션 편집하기"
              >
                <Edit className="h-3 w-3 mr-1" /> 편집
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-600 hover:text-[#ff68b4] hover:bg-[#fff8fb]"
                onClick={onRegenerate}
                title="이 섹션 다시 생성하기"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> 재생성
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
