interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * API 응답 캐싱을 관리하는 클래스
 * TTL(Time-To-Live) 기반으로 캐시 만료를 처리합니다.
 */
class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private TTL: number = 30 * 60 * 1000; // 기본 30분 캐시

  /**
   * 캐시 TTL 설정 (밀리초 단위)
   */
  setTTL(ttl: number): void {
    this.TTL = ttl;
  }

  /**
   * 데이터를 캐시에 저장
   */
  set<T>(key: string, data: T, customTTL?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // 커스텀 TTL이 설정된 경우 해당 시간 후 자동 삭제
    if (customTTL) {
      setTimeout(() => this.cache.delete(key), customTTL);
    }
  }

  /**
   * 캐시에서 데이터 가져오기
   * 만료된 데이터는 자동으로 삭제하고 null 반환
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // TTL 체크하여 만료된 경우 삭제
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * 모든 캐시 항목 삭제
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 특정 키 패턴과 일치하는 캐시 항목 삭제
   */
  clearByPattern(pattern: string): void {
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * 캐시 키를 생성합니다.
   * 객체를 JSON 문자열로 변환하여 일관된 키를 생성합니다.
   */
  generateKey(params: Record<string, any>): string {
    return JSON.stringify(params);
  }
  
  /**
   * 현재 캐시 상태에 대한 통계 정보 반환
   */
  getStats() {
    const now = Date.now();
    let activeItems = 0;
    let expiredItems = 0;
    
    this.cache.forEach(item => {
      if (now - item.timestamp <= this.TTL) {
        activeItems++;
      } else {
        expiredItems++;
      }
    });
    
    return {
      totalItems: this.cache.size,
      activeItems,
      expiredItems
    };
  }
}

// 싱글턴 인스턴스 생성
export const apiCache = new ApiCache(); 