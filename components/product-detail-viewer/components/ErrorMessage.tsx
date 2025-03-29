import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorMessageProps {
  error: string | null; // Error message string or null
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) {
    return null; // Don't render if there's no error
  }

  return (
    <div className="bg-red-50 rounded-lg border border-red-200 p-4 m-4 animate-in fade-in duration-300"> {/* Added fade-in animation */}
      <div className="flex items-start">
        <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" /> {/* Added margin and shrink */}
        <div>
          <h3 className="text-sm font-medium text-red-800 mb-1">
            오류 발생
          </h3>
          <p className="text-sm text-red-700">
            {/* Display the error message */}
            {error}
          </p>
          {/* Optional: Add a retry button or more details if needed */}
          {/* <Button variant="link" size="sm" className="text-red-700 mt-1 p-0 h-auto">다시 시도</Button> */}
        </div>
      </div>
    </div>
  );
};
