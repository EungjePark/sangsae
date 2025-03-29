/**
 * 에러 처리를 위한 유틸리티 함수들
 */

export interface ApiErrorResponse {
  status: number;
  message: string;
  isTokenLimitError: boolean;
  isNetworkError: boolean;
  isAuthError: boolean;
  originalError?: unknown;
}

/**
 * API 응답이 성공적인지 확인
 * @param response Fetch API Response 객체
 * @returns 응답이 성공적이면 true, 그렇지 않으면 false
 */
export const isSuccessResponse = (response: Response): boolean => {
  return response.ok && response.status >= 200 && response.status < 300;
};

/**
 * 토큰 제한 관련 오류인지 확인
 * @param error 에러 객체 또는 메시지
 * @returns 토큰 제한 오류이면 true, 아니면 false
 */
export const isTokenLimitError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('할당량') ||
    errorMessage.includes('API key') ||
    errorMessage.includes('429')
  );
};

/**
 * 네트워크 관련 오류인지 확인
 * @param error 에러 객체
 * @returns 네트워크 오류이면 true, 아니면 false
 */
export const isNetworkError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connect') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('ECONNREFUSED')
  );
};

/**
 * 인증 관련 오류인지 확인
 * @param error 에러 객체 또는 상태 코드
 * @returns 인증 오류이면 true, 아니면 false
 */
export const isAuthError = (error: unknown): boolean => {
  if (typeof error === 'number') {
    return error === 401 || error === 403;
  }
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('auth') ||
    errorMessage.includes('401') ||
    errorMessage.includes('403')
  );
};

/**
 * 오류 메시지 추출
 * @param error 에러 객체
 * @returns 사용자에게 보여줄 오류 메시지
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  
  // Error 객체인 경우
  if (error instanceof Error) {
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }
  
  // API 응답 객체인 경우 (JSON 형태)
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  
  // 단순 문자열인 경우
  if (typeof error === 'string') {
    return error;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * API 오류 처리 및 형식화
 * @param error 에러 객체
 * @param defaultMessage 기본 오류 메시지
 * @returns 형식화된 에러 응답 객체
 */
export const handleApiError = (error: unknown, defaultMessage: string = '요청 처리 중 오류가 발생했습니다.'): ApiErrorResponse => {
  console.error('API Error:', error);
  
  // 기본 응답 구조
  const response: ApiErrorResponse = {
    status: 500,
    message: defaultMessage,
    isTokenLimitError: false,
    isNetworkError: false,
    isAuthError: false,
    originalError: error
  };
  
  // HTTP 응답 객체인 경우
  if (error instanceof Response) {
    response.status = error.status;
    
    if (error.status === 429) {
      response.message = 'AI 생성 할당량이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
      response.isTokenLimitError = true;
    } else if (error.status === 401 || error.status === 403) {
      response.message = '인증에 실패했습니다. 다시 로그인해 주세요.';
      response.isAuthError = true;
    } else if (error.status === 404) {
      response.message = '요청한 리소스를 찾을 수 없습니다.';
    }
    
    return response;
  }
  
  // 일반 에러 객체인 경우
  const errorMessage = extractErrorMessage(error);
  response.message = errorMessage;
  
  // 토큰 제한 오류 확인
  if (isTokenLimitError(error)) {
    response.isTokenLimitError = true;
    response.status = 429;
    response.message = 'AI 생성 할당량이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
  }
  
  // 네트워크 오류 확인
  if (isNetworkError(error)) {
    response.isNetworkError = true;
    response.status = 0;
    response.message = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.';
  }
  
  // 인증 오류 확인
  if (isAuthError(error)) {
    response.isAuthError = true;
    response.status = 401;
    response.message = '인증에 실패했습니다. 다시 로그인해 주세요.';
  }
  
  return response;
};

/**
 * 에러 응답에 따른 사용자 친화적 메시지 생성
 * @param error 에러 응답 객체
 * @returns 사용자에게 보여줄 메시지와 추가 액션 안내
 */
export const getUserFriendlyErrorMessage = (error: ApiErrorResponse): { message: string; action?: string } => {
  // 토큰 제한 오류
  if (error.isTokenLimitError) {
    return {
      message: 'AI 생성 할당량이 초과되었습니다.',
      action: '잠시 후 다시 시도해 주세요.'
    };
  }
  
  // 네트워크 오류
  if (error.isNetworkError) {
    return {
      message: '네트워크 연결에 문제가 있습니다.',
      action: '인터넷 연결을 확인하고 다시 시도해 주세요.'
    };
  }
  
  // 인증 오류
  if (error.isAuthError) {
    return {
      message: '인증에 실패했습니다.',
      action: '다시 로그인해 주세요.'
    };
  }
  
  // 기타 오류에 대한 기본 메시지
  return {
    message: error.message || '요청 처리 중 오류가 발생했습니다.',
    action: '다시 시도하거나 관리자에게 문의해 주세요.'
  };
}; 