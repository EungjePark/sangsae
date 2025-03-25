import React from 'react';
import { useSectionManagement } from '@/hooks/product/useSectionManagement';
import { usePdfGeneration } from '@/hooks/product/usePdfGeneration';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatContent } from '@/lib/content-formatter';

interface GeneratedContentProps {
  generatedContent: any;
  onRegenerate: (sectionId: string) => Promise<void>;
  isRegenerating: Record<string, boolean>;
}

export default function GeneratedContent({ 
  generatedContent, 
  onRegenerate, 
  isRegenerating 
}: GeneratedContentProps) {
  // 섹션 관리 관련 훅 사용 (객체 구조 분해)
  const {
    // 상태
    hiddenSections,
    sectionOrder,
    draggedSection,
    isEditing,
    editedContent,
    
    // 액션
    getKoreanTitle,
    getSectionClasses,
    getEmoji,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    toggleSection,
    startEdit,
    cancelEdit,
    saveEdit,
    makeContentFriendly
  } = useSectionManagement();

  // PDF 생성 관련 훅 사용
  const { handleDownloadPDF, createPreviewModal } = usePdfGeneration({
    getKoreanTitle,
    makeContentFriendly
  });

  // 콘텐츠가 없는 경우 표시할 내용 없음
  if (!generatedContent || !generatedContent.sections || generatedContent.sections.length === 0) {
    return null;
  }

  // 섹션 콘텐츠 표시
  const renderSectionContent = (section: any) => {
    const sectionId = section.id;
    
    // 에디팅 중인 섹션 렌더링
    if (isEditing[sectionId]) {
      return (
        <div className="mt-2">
          <textarea
            className="w-full min-h-[150px] p-3 rounded-md border border-gray-300 focus:border-[#ff68b4] focus:ring-1 focus:ring-[#ff68b4] focus:outline-none text-sm"
            value={editedContent[sectionId] || ''}
            onChange={(e) => saveEdit(sectionId, e.target.value, false)}
          />
          <div className="flex space-x-2 mt-2">
            <button
              className="px-2 py-1 bg-[#ff68b4] text-white rounded-md text-xs hover:bg-[#ff45a8] focus:outline-none"
              onClick={() => saveEdit(sectionId, editedContent[sectionId] || '', true)}
            >
              저장
            </button>
            <button
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 focus:outline-none"
              onClick={() => cancelEdit(sectionId)}
            >
              취소
            </button>
          </div>
        </div>
      );
    }
    
    // 일반 섹션 콘텐츠 렌더링 (제목 태그 제거 및 마크다운 강조 표시 제거)
    const formattedContent = formatContent(section.content);
    
    return (
      <div className="mt-2 text-gray-700 whitespace-pre-line pl-1 text-sm leading-relaxed">
        {formattedContent}
      </div>
    );
  };

  // 섹션 순서에 따라 정렬하여 표시
  const sortedSections = [...generatedContent.sections].sort((a, b) => {
    const orderA = sectionOrder[a.id] !== undefined ? sectionOrder[a.id] : 999;
    const orderB = sectionOrder[b.id] !== undefined ? sectionOrder[b.id] : 999;
    return orderA - orderB;
  });

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          생성된 콘텐츠
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => createPreviewModal(generatedContent, hiddenSections, sectionOrder)}
            className="px-3 py-1.5 bg-[#ff68b4] text-white rounded-md text-sm hover:bg-[#ff45a8] focus:outline-none flex items-center"
          >
            <span className="mr-1">👁️</span> 미리보기
          </button>
          <button
            onClick={() => handleDownloadPDF(
              generatedContent, 
              generatedContent.productName, 
              generatedContent.productCategory, 
              hiddenSections, 
              sectionOrder
            )}
            className="px-3 py-1.5 bg-[#ff68b4] text-white rounded-md text-sm hover:bg-[#ff45a8] focus:outline-none flex items-center"
          >
            <span className="mr-1">📄</span> PDF 다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
        {sortedSections.map((section: any) => (
          <div
            key={section.id}
            className={`${getSectionClasses(section.id, hiddenSections)} rounded-lg border border-gray-200 shadow-sm
                        ${draggedSection === section.id ? 'opacity-50' : 'opacity-100'}`}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getEmoji(section.id)}</span>
                  <h3 className="text-lg font-medium text-gray-800">{getKoreanTitle(section.id)}</h3>
                </div>
                
                <div className="flex space-x-1">
                  {/* 편집 버튼 */}
                  <button
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => startEdit(section.id, section.content)}
                    title="내용 편집"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  
                  {/* 재생성 버튼 */}
                  <button 
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => onRegenerate(section.id)}
                    disabled={isRegenerating[section.id]}
                    title="내용 재생성"
                  >
                    {isRegenerating[section.id] ? (
                      <LoadingSpinner size="sm" showText={false} className="text-gray-500" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                  
                  {/* 표시/숨김 토글 버튼 */}
                  <button
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => toggleSection(section.id)}
                    title={hiddenSections.includes(section.id) ? "섹션 표시" : "섹션 숨김"}
                  >
                    {hiddenSections.includes(section.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* 드래그 핸들 아이콘과 안내 텍스트 */}
              <div className="flex items-center text-gray-400 text-xs mt-1 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                드래그하여 순서 변경
              </div>
              
              {/* 섹션 내용 */}
              {!hiddenSections.includes(section.id) && renderSectionContent(section)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}