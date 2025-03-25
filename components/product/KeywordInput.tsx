import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KeywordInputProps {
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
  placeholder?: string;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ 
  keywords, 
  setKeywords,
  placeholder = '키워드 입력 후 Enter'
}) => {
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const trimmedKeyword = inputValue.trim();
    if (trimmedKeyword && keywords.length < 10 && !keywords.includes(trimmedKeyword)) {
      setKeywords([...keywords, trimmedKeyword]);
      setInputValue('');
    } else if (keywords.length >= 10) {
      toast({
        title: "키워드 제한",
        description: "키워드는 최대 10개까지 추가할 수 있습니다.",
        variant: "destructive"
      });
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...keywords];
    newKeywords.splice(index, 1);
    setKeywords(newKeywords);
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow"
        />
        <Button 
          type="button" 
          onClick={addKeyword}
          variant="outline"
          disabled={!inputValue.trim() || keywords.length >= 10}
        >
          추가
        </Button>
      </div>
      
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((keyword, index) => (
            <div 
              key={index} 
              className="flex items-center bg-gray-100 text-gray-800 text-sm rounded-full px-3 py-1"
            >
              <span>{keyword}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeKeyword(index)}
                className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-1">
        키워드는 최대 10개까지 추가할 수 있습니다. (현재 {keywords.length}/10)
      </div>
    </div>
  );
};

export default KeywordInput; 