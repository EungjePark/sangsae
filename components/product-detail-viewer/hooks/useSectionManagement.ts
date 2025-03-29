import React from 'react';
import { getSectionOrder } from '../utils/sectionHelpers';
import { getKoreanTitle } from '@/lib/sections/section-manager'; // Assuming this path is correct

export function useSectionManagement(
  draggedSection: string | null,
  setDraggedSection: (sectionId: string | null) => void,
  hiddenSections: string[],
  setHiddenSections: (sections: string[]) => void,
  sectionOrder: Record<string, number>,
  setSectionOrder: (order: Record<string, number>) => void,
  toast: any // Consider using a more specific type if available
) {
  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
    // Add visual cue (optional, can be handled in component)
    // const element = document.getElementById(`section-${sectionId}`);
    // if (element) element.classList.add('dragging');
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    // Remove visual cues (optional, can be handled in component)
    // document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove()); // Clean up indicators
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (!draggedSection || draggedSection === sectionId) return;

    const targetElement = (e.currentTarget as HTMLElement).closest(`#section-${sectionId}`);
    if (!targetElement) return;

    // Remove existing indicators
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

    // Create and position the drop indicator
    const rect = targetElement.getBoundingClientRect();
    const dropMarker = document.createElement('div');
    dropMarker.className = 'drop-indicator absolute left-0 right-0 h-1 z-30 bg-[#ff68b4] pointer-events-none'; // Added pointer-events-none
    const cursorY = e.clientY;
    const isTopHalf = cursorY < rect.top + rect.height / 2;

    dropMarker.style.top = isTopHalf ? '-4px' : ''; // Position above/below the element slightly offset
    dropMarker.style.bottom = isTopHalf ? '' : '-4px';
    // dropMarker.style.transform = isTopHalf ? 'translateY(-50%)' : 'translateY(50%)'; // Transform might cause issues with absolute positioning

    // Ensure the target element can contain the absolute positioned indicator and is an HTMLElement
    if (targetElement instanceof HTMLElement) {
      if (getComputedStyle(targetElement).position === 'static') {
         targetElement.style.position = 'relative'; // Temporarily set relative positioning if static
      }
      targetElement.appendChild(dropMarker);
    } else {
      console.warn("Target element is not an HTMLElement, cannot append drop indicator or set style.");
    }
  };

   const handleDragLeave = (e: React.DragEvent, sectionId: string) => {
    // Remove indicator if cursor leaves the droppable area boundary
    const relatedTarget = e.relatedTarget as Node | null;
    const currentTarget = e.currentTarget as HTMLElement;

    if (!currentTarget.contains(relatedTarget)) {
       const indicator = currentTarget.querySelector('.drop-indicator');
       if (indicator) {
           indicator.remove();
       }
    }
  };


  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove()); // Clean up indicators

    if (draggedSection && draggedSection !== targetSectionId) {
      const currentOrder = { ...sectionOrder };
      const allSectionIds = Object.keys(currentOrder).length > 0
         ? Object.keys(currentOrder)
         : []; // Need a way to get all potential section IDs if order isn't fully populated

      // Calculate the order values based on existing sections or default order
      const sortedSections = allSectionIds
        .map(id => ({ id, order: currentOrder[id] ?? getSectionOrder(id) }))
        .sort((a, b) => a.order - b.order);

      const targetIndex = sortedSections.findIndex(s => s.id === targetSectionId);
      const draggedIndex = sortedSections.findIndex(s => s.id === draggedSection);

      if (targetIndex === -1) {
          console.error("Target section not found in sorted list");
          setDraggedSection(null);
          return;
      }

      // Determine if dropping above or below the target
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cursorY = e.clientY;
      const isTopHalf = cursorY < rect.top + rect.height / 2;

      let newOrderValue: number;

      if (isTopHalf) {
          // Dropping above the target
          if (targetIndex === 0) {
              // Dropping above the first item
              newOrderValue = (sortedSections[0]?.order ?? getSectionOrder(targetSectionId)) - 10; // Assign a value lower than the first
          } else {
              // Dropping between targetIndex-1 and targetIndex
              const prevOrder = sortedSections[targetIndex - 1]?.order ?? getSectionOrder(sortedSections[targetIndex - 1]?.id);
              const targetOrder = sortedSections[targetIndex]?.order ?? getSectionOrder(targetSectionId);
              newOrderValue = (prevOrder + targetOrder) / 2;
          }
      } else {
          // Dropping below the target
          if (targetIndex === sortedSections.length - 1) {
              // Dropping below the last item
              newOrderValue = (sortedSections[targetIndex]?.order ?? getSectionOrder(targetSectionId)) + 10; // Assign a value higher than the last
          } else {
              // Dropping between targetIndex and targetIndex+1
              const targetOrder = sortedSections[targetIndex]?.order ?? getSectionOrder(targetSectionId);
              const nextOrder = sortedSections[targetIndex + 1]?.order ?? getSectionOrder(sortedSections[targetIndex + 1]?.id);
              newOrderValue = (targetOrder + nextOrder) / 2;
          }
      }


      // Update the order state
      setSectionOrder({
        ...currentOrder,
        [draggedSection]: newOrderValue,
      });
    }
    setDraggedSection(null); // Reset dragged section
  };

  const handleHideSection = (sectionId: string) => {
    setHiddenSections([...hiddenSections, sectionId]);
    toast({
      title: "섹션 숨김",
      description: `${getKoreanTitle(sectionId)} 섹션이 숨겨졌습니다.`
    });
  };

  const handleShowSection = (sectionId: string) => {
    // This function might be needed if you implement a way to show hidden sections again
    setHiddenSections(hiddenSections.filter(id => id !== sectionId));
     toast({
      title: "섹션 표시",
      description: `${getKoreanTitle(sectionId)} 섹션이 다시 표시됩니다.`
    });
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave, // Added drag leave handler
    handleDrop,
    handleHideSection,
    handleShowSection // Added show section handler
  };
}
