import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tokenUsageTracker, TokenUsage } from '@/lib/gemini';

export function TokenUsageDisplay() {
  const [dailyUsage, setDailyUsage] = useState<TokenUsage | null>(null);
  const [totalUsage, setTotalUsage] = useState<{ inputTokens: number; outputTokens: number; cost: number }>();
  const [usageHistory, setUsageHistory] = useState<TokenUsage[]>([]);
  const [isClient, setIsClient] = useState(false);

  // 무료 할당량 (매월 재설정)
  const freeQuota = {
    total: 1000000, // 총 100만 토큰
    used: 0,
  };

  useEffect(() => {
    setIsClient(true);
    
    // 사용량 데이터 로드
    const daily = tokenUsageTracker.getDailyUsage();
    const total = tokenUsageTracker.getTotalUsage();
    const history = tokenUsageTracker.getAllUsage();
    
    setDailyUsage(daily);
    setTotalUsage(total);
    setUsageHistory(history);
    
    // 무료 할당량 사용량 계산
    freeQuota.used = total.inputTokens + total.outputTokens;
  }, []);

  if (!isClient) {
    return null; // 서버 사이드 렌더링 시 아무것도 표시하지 않음
  }

  // 할당량 사용 비율
  const quotaPercentage = Math.min(100, Math.round((freeQuota.used / freeQuota.total) * 100));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gemini API 토큰 사용량</CardTitle>
        <CardDescription>API 호출에 사용된 토큰 수와 예상 비용</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">오늘</TabsTrigger>
            <TabsTrigger value="total">전체</TabsTrigger>
            <TabsTrigger value="quota">할당량</TabsTrigger>
          </TabsList>
          
          {/* 오늘 사용량 */}
          <TabsContent value="daily">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-1">오늘 사용량</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">입력 토큰</p>
                    <p className="text-2xl font-bold">{dailyUsage?.inputTokens.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">출력 토큰</p>
                    <p className="text-2xl font-bold">{dailyUsage?.outputTokens.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-1">예상 비용</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">USD 기준 (원화 환산 별도)</p>
                  <p className="text-2xl font-bold">${dailyUsage?.cost.toFixed(4) || '0.0000'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* 전체 사용량 */}
          <TabsContent value="total">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-1">누적 사용량</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">총 입력 토큰</p>
                    <p className="text-2xl font-bold">{totalUsage?.inputTokens.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">총 출력 토큰</p>
                    <p className="text-2xl font-bold">{totalUsage?.outputTokens.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-1">총 예상 비용</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">USD 기준 (원화 환산 별도)</p>
                  <p className="text-2xl font-bold">${totalUsage?.cost.toFixed(4) || '0.0000'}</p>
                </div>
              </div>
              
              {usageHistory.length > 1 && (
                <div>
                  <h3 className="text-md font-medium mb-1">일별 사용량 기록</h3>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">날짜</th>
                          <th className="text-right py-2">입력 토큰</th>
                          <th className="text-right py-2">출력 토큰</th>
                          <th className="text-right py-2">비용 (USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageHistory.map((day, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-2">{day.date}</td>
                            <td className="text-right py-2">{day.inputTokens.toLocaleString()}</td>
                            <td className="text-right py-2">{day.outputTokens.toLocaleString()}</td>
                            <td className="text-right py-2">${day.cost.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* 할당량 */}
          <TabsContent value="quota">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-1">무료 할당량</h3>
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      사용량: {freeQuota.used.toLocaleString()} / {freeQuota.total.toLocaleString()} 토큰
                    </span>
                    <span className="text-sm font-medium">{quotaPercentage}%</span>
                  </div>
                  <Progress value={quotaPercentage} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {quotaPercentage >= 80 
                      ? "무료 할당량이 거의 소진되었습니다. 유료 계정으로 업그레이드를 고려해보세요."
                      : "매월 100만 토큰이 무료로 제공됩니다."}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-1">Gemini API 가격</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">모델</th>
                      <th className="text-right py-2">입력 (1K 토큰)</th>
                      <th className="text-right py-2">출력 (1K 토큰)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Gemini 1.5 Pro</td>
                      <td className="text-right py-2">$0.00025</td>
                      <td className="text-right py-2">$0.00075</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Gemini 1.5 Flash</td>
                      <td className="text-right py-2">$0.00010</td>
                      <td className="text-right py-2">$0.00030</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        데이터는 브라우저 로컬 스토리지에 저장됩니다. 실제 Google 결제 정보와 다를 수 있습니다.
      </CardFooter>
    </Card>
  );
}

export { TokenUsageDisplay as TokenUsageTracker } from './token-usage';
