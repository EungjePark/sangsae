import React from 'react';
import { type ProductDetailSection, type ProductCategory } from '@/types/product';
import { cleanupColons } from './contentFormatters';
import { getKoreanTitle } from '@/lib/sections/section-manager'; // Assuming this path is correct

// TODO: Implement or import these functions if needed elsewhere, or keep local if only used here
const enhanceContentForTarget = (content: string, targetCustomers: string, productCategory: string): string => {
  // Placeholder implementation - adapt based on actual logic if needed
  return content;
};

const generateCustomAnswer = (question: string, targetCustomers: string, productCategory: string): string => {
  // Placeholder implementation - adapt based on actual logic if needed
  console.warn(`FAQ 질문에 대한 실제 답변을 찾지 못했습니다: "${question}"`, { targetCustomers, productCategory });
  // Provide more specific default answers based on question keywords
  if (question.includes('소재') || question.includes('재질')) {
    return '고급 면 소재로 제작되어 내구성이 뛰어나며 부드러운 촉감을 제공합니다.';
  } else if (question.includes('세탁') || question.includes('관리')) {
    return '30도 이하 물에서 중성세제 사용, 표백제 사용 금지, 그늘에서 자연 건조 권장.';
  } else if (question.includes('배송') || question.includes('배달')) {
    return '주문 후 1-2일 내 출고, 1-3일 내 배송됩니다. 마이페이지에서 확인 가능.';
  } else if (question.includes('교환') || question.includes('반품') || question.includes('환불')) {
    return '수령 후 7일 이내 교환/반품 가능. 고객 변심 시 왕복 배송비 부담.';
  } else if (question.includes('사이즈') || question.includes('크기')) {
    return '프리 사이즈, 허리 둘레 최대 120cm, 총 길이 90cm.'; // Example size
  }
  return '상세 정보는 고객센터로 문의해 주세요.'; // Generic fallback
};

// FAQ 렌더링 함수 개선 - 과도하게 긴 응답 문제 해결 및 로직 분리
const renderFAQSection = (lines: string[], targetCustomers: string = '', productCategory: string = '') => {
  const faqItems: { question: string; answer: string }[] = [];
  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];

  const brandPrimary = '#ff68b4'; // Consider making this a prop or theme variable

  // FAQ 추출 개선 - 다양한 패턴 인식
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 질문으로 보이는 라인 (한글, 숫자 포함 다양한 Q&A 패턴 인식)
    const isQuestionRegex = new RegExp(
      /^(?:Q[0-9]*[\s.:]|질문[\s.:]|[Q][0-9]*\s*[.:])|(?:\?|？)$|^[0-9]+[\s.]*\s*[가-힣a-zA-Z\s]+(?:\?|？)|(?:어떻게|무엇|언제|왜|방법|가능).*(?:나요$|인가요$|가요$|까요$)/i
    );

    const isQuestion = isQuestionRegex.test(line);

    if (isQuestion) {
      // 이전 질문/답변 세트 저장
      if (currentQuestion && currentAnswerLines.length > 0) {
        faqItems.push({
          question: currentQuestion,
          answer: currentAnswerLines.join('\n')
        });
      }

      // 새 질문 시작 - Q1., Q: 등 다양한 형식 처리
      currentQuestion = line.replace(/^(?:Q[0-9]*[\s.:]|질문[\s.:]|\[질문\][\s.:]|[Q][0-9]*\s*[.:]|[0-9]+[\s.]*\s*)/i, '').trim();
      currentAnswerLines = [];

      // 다음 라인을 답변으로 가정
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        // 다음 라인이 답변 형식인지 확인 (질문 형식이 아니어야 함)
        if (nextLine && !isQuestionRegex.test(nextLine)) {

          // A: 로 시작하는 라인 처리
          const cleanedAnswer = nextLine.replace(/^(?:A[0-9]*[\s.:]|답변[\s.:]|\[답변\][\s.:]|[A][0-9]*\s*[.:]|[0-9]+[\s.]*\s*)/i, '').trim();

          // 실제 내용이 있으면 답변으로 추가 (준비 중 문구 제외)
          if (cleanedAnswer && !cleanedAnswer.includes('답변 준비 중입니다')) {
            currentAnswerLines.push(cleanedAnswer);
            i++; // 다음 줄은 이미 처리했으므로 건너뜀

            // 추가 설명 라인이 있다면 답변에 포함 (최대 1줄로 제한)
            let j = i + 1;
            let additionalLines = 0;
            const MAX_ADDITIONAL_LINES = 1;

            while (j < lines.length && additionalLines < MAX_ADDITIONAL_LINES) {
              const additionalLine = lines[j].trim();
              // 다음 질문이 시작되거나 빈 줄이면 현재 답변 종료
              if (!additionalLine || isQuestionRegex.test(additionalLine)) {
                break;
              }

              // 불필요한 텍스트 제외하고 답변에 추가
              if (!additionalLine.includes('답변 준비 중입니다') &&
                  !additionalLine.includes('곧 업데이트 될 예정입니다')) {
                currentAnswerLines.push(additionalLine);
                additionalLines++;
              }
              j++;
               i = j - 1; // i는 다음 루프에서 증가할 것이므로 j-1로 설정
             }

             // 답변 길이 제한 로직 제거
             // if (currentAnswerLines.join(' ').length > 150) {
             //   const combinedAnswer = currentAnswerLines.join(' ');
             //   currentAnswerLines = [combinedAnswer.substring(0, 150) + '...'];
             // }
           }
         }
      }

      // 여전히 답변이 없다면 실제 답변 생성 시도
      if (currentAnswerLines.length === 0 && currentQuestion) {
         currentAnswerLines.push(generateCustomAnswer(currentQuestion, targetCustomers, productCategory));
      }
    }
  }

  // 마지막 질문/답변 세트 저장
  if (currentQuestion && currentAnswerLines.length > 0) {
    faqItems.push({
      question: currentQuestion,
      answer: currentAnswerLines.join('\n')
    });
  }

  // 기본 FAQ 항목 제공 (FAQ 항목이 없을 경우) - 좀 더 일반적인 질문으로 변경
  if (faqItems.length === 0) {
    faqItems.push(
      {
        question: "배송 기간은 얼마나 소요되나요?",
        answer: "일반적으로 주문 후 영업일 기준 2~3일 내에 배송됩니다. 지역 및 택배사 사정에 따라 달라질 수 있습니다."
      },
      {
        question: "교환이나 반품 정책은 어떻게 되나요?",
        answer: "상품 수령 후 7일 이내에 교환 및 반품 신청이 가능합니다. 자세한 내용은 상세 페이지 하단 또는 고객센터를 통해 확인해주세요."
      },
      {
        question: "이 제품의 주요 특징은 무엇인가요?",
        answer: "본 제품은 [주요 특징 1], [주요 특징 2] 등의 장점을 가지고 있어 사용자에게 [핵심 가치]를 제공합니다." // Placeholder
      }
    );
  }

  // 최대 표시할 FAQ 항목 수 제한
  const MAX_FAQ_ITEMS = 6;
  const displayFaqItems = faqItems.slice(0, MAX_FAQ_ITEMS);

  // FAQ 렌더링 UI 개선
  return (
    <div className="space-y-6">
      {displayFaqItems.map((item, idx) => (
        <div key={`faq-${idx}`} className="bg-white rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 bg-[#f5f5f7]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-white text-[#1d1d1f] font-medium shadow-sm">
                  Q
                </div>
                <h3 className="text-base font-medium text-[#1d1d1f] leading-relaxed pt-1.5 pr-8">{item.question}</h3>
              </div>
              <div>
                <svg 
                  className="h-5 w-5 text-[#86868b] group-open:rotate-180 transition-transform" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>
            <div className="p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] font-medium">
                  A
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-[#424245] leading-relaxed text-sm whitespace-pre-wrap">{item.answer}</p>
                </div>
              </div>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
};

/**
 * FAQ 섹션 렌더링을 위한 헬퍼 함수
 * Q: 질문 / A: 답변 형식의 내용을 예쁘게 렌더링합니다.
 */
export const renderFaqSection = (content: string): JSX.Element => {
  if (!content) return <div>내용이 없습니다.</div>;
  
  // Q&A 쌍으로 분리 (s 플래그 없이 구현)
  // 여러 줄에 걸쳐 패턴 매칭을 위해 콘텐츠를 줄바꿈 문자로 분리하고 처리
  const qaPairs: Array<{question: string, answer: string}> = [];
  
  // 콘텐츠를 줄 단위로 처리
  const lines = content.split('\n');
  let currentQuestion = '';
  let currentAnswer = '';
  let inQuestion = false;
  let inAnswer = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('Q:')) {
      // 새 질문이 시작되면 이전 Q&A 저장
      if (currentQuestion && (currentAnswer || inAnswer)) {
        qaPairs.push({
          question: currentQuestion.trim(),
          answer: currentAnswer.trim()
        });
        currentQuestion = '';
        currentAnswer = '';
      }
      
      // 새 질문 시작
      currentQuestion = line.substring(2).trim();
      inQuestion = true;
      inAnswer = false;
    } 
    else if (line.startsWith('A:')) {
      // 답변 시작
      currentAnswer = line.substring(2).trim();
      inQuestion = false;
      inAnswer = true;
    }
    else if (line === '') {
      // 빈 줄 무시
      continue;
    }
    else {
      // 질문이나 답변 내용 추가
      if (inQuestion) {
        currentQuestion += ' ' + line;
      } else if (inAnswer) {
        currentAnswer += ' ' + line;
      }
    }
  }
  
  // 마지막 Q&A 쌍 추가
  if (currentQuestion && (currentAnswer || inAnswer)) {
    qaPairs.push({
      question: currentQuestion.trim(),
      answer: currentAnswer.trim()
    });
  }
  
  // Q&A 쌍이 없으면 원본 내용 그대로 표시
  if (qaPairs.length === 0) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }
  
  return (
    <div className="space-y-6">
      {qaPairs.map((pair, idx) => (
        <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 bg-[#f5f5f7]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-white text-[#1d1d1f] font-medium shadow-sm">
                  Q
                </div>
                <h3 className="text-base font-medium text-[#1d1d1f] leading-relaxed pt-1.5 pr-8">{pair.question}</h3>
              </div>
              <div>
                <svg 
                  className="h-5 w-5 text-[#86868b] group-open:rotate-180 transition-transform" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>
            <div className="p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] font-medium">
                  A
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-[#424245] leading-relaxed text-sm whitespace-pre-wrap">{pair.answer || '답변 내용이 없습니다.'}</p>
                </div>
              </div>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
};

// 섹션 렌더링 함수 개선
export function renderSection(content: string, targetCustomers?: string, productCategory?: string): JSX.Element {
  if (typeof content !== 'string') {
    console.warn('renderSection: content is not a string', content);
    return <div className="text-red-500">콘텐츠 형식 오류</div>;
  }

  // 추가 컨텐츠 정리 - 마크다운 문법 제거
  content = content
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#+\s+(.*)$/gm, '$1')
    .replace(/\n{3,}/g, '\n\n');

  // 일반 텍스트 렌더링으로 단순화
  return renderGenericSection(content);
}

// 기능/혜택 섹션 렌더링 함수
export function renderFeatureSection(sectionId: string, content: string): JSX.Element {
  // 기능 포인트 구분
  // 패턴: 1. 항목, • 항목, - 항목, 또는 "특징: 설명" 형식
  const featurePatterns = [
    /(\d+\.\s*(.*?))\s*\n/g,  // 숫자. 항목
    /(•\s*(.*?))\s*\n/g,      // • 항목
    /(-\s*(.*?))\s*\n/g,      // - 항목
    /(.*?):\s*(.*?)\s*\n/g    // 특징: 설명
  ];
  
  // 각 줄을 분석하여 기능 항목 추출
  const contentLines = content.split('\n');
  let processedContent = '';
  
  // 각 줄에 대한 처리
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim();
    
    if (!line) {
      processedContent += '\n\n';
      continue;
    }
    
    // 기능 항목인지 확인
    let isFeatureItem = false;
    for (const pattern of featurePatterns) {
      if (pattern.test(line + '\n')) {
        isFeatureItem = true;
        break;
      }
    }
    
    // 기능 항목을 카드 형식으로 변환
    if (isFeatureItem) {
      // 항목 형식 추출
      let featureTitle = '';
      let featureDescription = '';
      
      if (line.match(/^\d+\.\s+/)) {
        // 숫자. 항목 형식
        [featureTitle, featureDescription] = line.replace(/^\d+\.\s+/, '').split(/:\s+/, 2);
        if (!featureDescription) featureDescription = featureTitle;
      } else if (line.match(/^[•-]\s+/)) {
        // • 또는 - 항목 형식
        [featureTitle, featureDescription] = line.replace(/^[•-]\s+/, '').split(/:\s+/, 2);
        if (!featureDescription) featureDescription = featureTitle;
      } else if (line.includes(':')) {
        // 특징: 설명 형식
        [featureTitle, featureDescription] = line.split(/:\s+/, 2);
      } else {
        // 그 외에는 전체를 설명으로 처리
        featureDescription = line;
      }
      
      processedContent += `<div class="feature-card">
        <div class="feature-title">${featureTitle || '기능'}</div>
        <div class="feature-description">${featureDescription || ''}</div>
      </div>\n\n`;
    } else {
      // 일반 텍스트는 문단으로 처리
      processedContent += `<p>${line}</p>\n\n`;
    }
  }
  
  // 기능/혜택 섹션 렌더링
  return (
    <div className="features-container">
      <div dangerouslySetInnerHTML={{ __html: processedContent }}></div>
      <style jsx global>{`
        .features-container p {
          margin: 0.75rem 0;
          color: #4b5563;
        }
        .feature-card {
          background: white;
          border: 1px solid #f3f4f6;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border-color: #fee2e2;
        }
        .feature-title {
          font-weight: 600;
          color: #ff68b4;
          margin-bottom: 0.5rem;
        }
        .feature-description {
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}

// 일반 섹션 렌더링
export function renderGenericSection(content: string): JSX.Element {
  // 일반 텍스트는 단락으로 구분하여 표시
  const paragraphs = content.split(/\n{2,}/);
  
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, idx) => {
        // 비어있는 단락은 무시
        if (!paragraph.trim()) return null;
        
        // 목록 항목인지 확인
        if (paragraph.match(/^\s*(\d+\.\s|•\s|-\s)/m)) {
          // 목록 항목을 추출하여 표시
          const listItems = paragraph
            .split(/\n/)
            .filter(line => line.trim())
            .map(line => line.replace(/^\s*(\d+\.\s|•\s|-\s)/, '').trim());
          
          return (
            <ul key={idx} className="list-disc pl-5 space-y-2">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="text-gray-700">{item}</li>
              ))}
            </ul>
          );
        }
        
        // 일반 텍스트는 단락으로 표시
        return (
          <p key={idx} className="text-gray-700 leading-relaxed">{paragraph}</p>
        );
      }).filter(Boolean)}
    </div>
  );
}

// 추가 헬퍼 함수들
export function renderAdditionalInfoSection(content: string): JSX.Element {
  return renderGenericSection(content);
}

export function renderShippingSection(content: string): JSX.Element {
  return renderGenericSection(content);
}

export function renderProductInfoSection(content: string, category: string): JSX.Element {
  return renderGenericSection(content);
}
