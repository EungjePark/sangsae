import React from 'react';
import { getEmoji, getSectionOrder } from '../utils/sectionHelpers';
import { getKoreanTitle } from '@/lib/sections/section-manager'; // Assuming path
import { Card, CardContent } from '@/components/ui/card';

// Define the expected structure for TOC items
interface TocItem {
  id: string;
  title: string; // Title might not be strictly needed if using getKoreanTitle
}

interface TableOfContentsProps {
  sections: TocItem[];
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, onLinkClick }) => {
  if (!sections || sections.length === 0) {
    return null; // Don't render anything if there are no sections
  }

  // Sort sections based on their defined order
  const sortedSections = [...sections].sort((a, b) => {
     const orderA = getSectionOrder(a.id);
     const orderB = getSectionOrder(b.id);
     return orderA - orderB;
  });

  return (
    <Card className="border border-gray-100 bg-gradient-to-r from-white to-[#fff8fb]/50 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#ff68b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h3 className="text-gray-800 font-semibold text-sm">목차</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sortedSections.map((section) => (
            <a
              key={section.id}
              href={`#section-${section.id}`} // Link to the section ID
              onClick={(e) => onLinkClick(e, section.id)}
              className="flex items-center p-2.5 rounded-md text-gray-600 hover:bg-[#fff8fb] hover:text-[#ff68b4] border border-gray-100/80 hover:border-pink-100 transition-all group text-xs shadow-sm bg-white"
              title={getKoreanTitle(section.id)} // Add tooltip for full title
            >
              <span className="text-[#ff68b4] mr-2 text-base group-hover:scale-110 transition-transform">{getEmoji(section.id)}</span>
              {/* Truncate long titles to prevent layout breaking */}
              <span className="font-medium truncate">{getKoreanTitle(section.id)}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
