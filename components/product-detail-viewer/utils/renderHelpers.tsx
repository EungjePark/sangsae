import React from 'react';
import { type ProductDetailSection, type ProductCategory } from '@/types/product';
import { cleanupColons } from './contentFormatters';
import { getKoreanTitle } from '@/lib/sections/section-manager'; // Assuming this path is correct

// TODO: Implement or import these functions if needed elsewhere, or keep local if only used here
const enhanceContentForTarget = (content: string, targetCustomers: string, productCategory: string): string => {
  // Placeholder implementation - adapt based on actual logic if needed
  console.log('enhanceContentForTarget called with:', { targetCustomers, productCategory });
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
    <div className="space-y-4">
      {displayFaqItems.map((item, idx) => (
        <div key={`faq-${idx}`} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
          {/* 질문 */}
          <div className="flex items-start p-4 bg-gradient-to-r from-[#fff1f8] to-white">
            <span className="font-semibold text-base mr-3 text-[#ff68b4]">Q</span>
            <p className="text-gray-800 font-medium text-sm flex-1">{item.question}</p>
          </div>

          {/* 답변 */}
          <div className="flex p-4 bg-white border-t border-gray-50">
            <span className="font-semibold text-base mr-3 text-gray-400">A</span>
            <div className="text-gray-600 flex-1">
              <p className="leading-relaxed text-sm whitespace-pre-line"> {/* 답변 줄바꿈 유지 */}
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
      {/* "더 많은 질문 보기" 버튼 제거됨 */}
    </div>
  );
};

/**
 * FAQ 섹션 렌더링을 위한 헬퍼 함수
 * Q: 질문 / A: 답변 형식의 내용을 예쁘게 렌더링합니다.
 */
export const renderFaqSection = (content: string): React.ReactNode => {
  if (!content) return null;
  
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
    <div className="space-y-4">
      {qaPairs.map((pair, idx) => (
        <div key={idx} className="bg-[#fff8fb] rounded-lg overflow-hidden border border-pink-100">
          <div className="bg-pink-50 p-3 border-b border-pink-100">
            <div className="flex items-start">
              <span className="font-medium text-pink-800 mr-2 text-sm">Q.</span>
              <span className="text-gray-800 font-medium text-sm">{pair.question}</span>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-start">
              <span className="font-medium text-[#ff68b4] mr-2 text-sm">A.</span>
              <span className="text-gray-700 text-sm">{pair.answer || '답변 내용이 없습니다.'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 섹션 렌더링 함수 개선 및 분리
export const renderSection = (section: ProductDetailSection, targetCustomers: string = '', productCategory: string = '') => {
  try {
    if (!section.content || section.content.trim() === '') {
      return <p className="text-gray-400 italic text-center py-4">내용이 없습니다</p>;
    }

    // 콘텐츠 정리 및 강화 (필요시)
    const cleanedContent = cleanupColons(section.content);
    const enhancedContent = enhanceContentForTarget(cleanedContent, targetCustomers, productCategory);
    const lines = enhancedContent.split(/\n/).filter(line => line.trim() !== '');

    // FAQ 섹션은 별도 함수에서 처리
    if (section.id === 'faq') {
      return renderFaqSection(section.content);
    }

    const brandPrimary = '#ff68b4'; // 테마 변수로 관리하는 것이 좋음

    return (
      <div className="text-gray-800 whitespace-pre-line leading-relaxed">
        {lines.map((line, idx) => {
          const key = `line-${section.id}-${idx}`;

          // 첫 줄은 섹션 제목으로 강조 (내용이 여러 줄일 때만)
          if (idx === 0 && lines.length > 1) {
            return (
              <div key={key} className="mb-5 pb-3 border-b border-gray-200">
                <h2 className="text-xl font-semibold" style={{ color: brandPrimary }}>
                  {line}
                </h2>
              </div>
            );
          }

          // 질문 형식 라인 (FAQ 외 섹션) -> 부제목 스타일
          if (line.endsWith('?') || line.endsWith('？')) {
            return (
              <div key={key} className="mt-5 mb-3">
                <h3 className="text-lg font-semibold" style={{ color: brandPrimary }}>
                  {line}
                </h3>
              </div>
            );
          }

          // 불렛 포인트 (들여쓰기 및 기본 마커)
          if (line.match(/^[-•●◦○*]\s+/)) {
            const bulletContent = line.replace(/^[-•●◦○*]\s+/, '');
            // 불렛 포인트 내 "타이틀: 내용" 형식 처리
            const titleContentMatch = bulletContent.match(/^([^:：]+)[:：]\s*(.+)/);
            if (titleContentMatch) {
               return (
                <div key={key} className="flex items-start mb-3 ml-4">
                  <span className="text-[#ff68b4] mr-2 mt-1 font-bold">•</span>
                  <div>
                    <span className="font-medium" style={{ color: brandPrimary }}>{titleContentMatch[1].trim()}</span>
                    <span className="text-gray-700">: {titleContentMatch[2].trim()}</span>
                  </div>
                </div>
              );
            }
            // 일반 불렛 포인트
            return (
              <div key={key} className="flex items-start mb-3 ml-4">
                <span className="text-[#ff68b4] mr-2 mt-1 font-bold">•</span>
                <span className="text-gray-700">{bulletContent}</span>
              </div>
            );
          }

          // 숫자 목록 (들여쓰기 및 숫자 표시)
          if (line.match(/^\d+\.\s+/)) {
            const numMatch = line.match(/^(\d+)\.\s+/);
            const numContent = line.replace(/^\d+\.\s+/, '');
             // 숫자 목록 내 "타이틀: 내용" 형식 처리
             const titleContentMatch = numContent.match(/^([^:：]+)[:：]\s*(.+)/);
             if (titleContentMatch) {
               return (
                 <div key={key} className="flex items-start mb-3 ml-4">
                   <span className="text-[#ff68b4] mr-2 mt-1 w-5 text-right font-medium">{numMatch?.[1]}.</span>
                   <div>
                     <span className="font-medium" style={{ color: brandPrimary }}>{titleContentMatch[1].trim()}</span>
                     <span className="text-gray-700">: {titleContentMatch[2].trim()}</span>
                   </div>
                 </div>
               );
             }
             // 일반 숫자 목록
            return (
              <div key={key} className="flex items-start mb-3 ml-4">
                <span className="text-[#ff68b4] mr-2 mt-1 w-5 text-right font-medium">{numMatch?.[1]}.</span>
                <span className="text-gray-700">{numContent}</span>
              </div>
            );
          }

          // "타이틀: 내용" 형식 (일반 텍스트, Q:/A: 제외)
           const titleContentMatchGeneral = line.match(/^([^:：]{1,30})[:：]\s*(.+)/);
           if (titleContentMatchGeneral && !line.startsWith('Q:') && !line.startsWith('A:')) {
             return (
               <div key={key} className="mb-3 p-2 bg-gray-50 rounded-md">
                  <span className="font-medium" style={{ color: brandPrimary }}>{titleContentMatchGeneral[1].trim()}</span>
                  <span className="text-gray-700">: {titleContentMatchGeneral[2].trim()}</span>
               </div>
             );
           }

          // 일반 텍스트 단락
          return (
            <div key={key} className="mb-3">
              <p className="text-gray-700 leading-relaxed">{line}</p>
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    console.error('섹션 렌더링 오류:', error);
    return <div className="text-red-500 p-4">내용을 표시하는 중 오류가 발생했습니다.</div>;
  }
};
