import { useState, useEffect } from 'react';
import { type ProductDetailContent } from '@/types/product'; // Assuming type path

export function useLoading(
    isGenerating: boolean,
    generatedContent: ProductDetailContent | null
) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("AI가 상세페이지를 만들고 있어요...");

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    let messageInterval: NodeJS.Timeout | null = null;
    let completionTimeout: NodeJS.Timeout | null = null;

    const messages = [
      "AI가 상세페이지를 만들고 있어요...",
      "창의적인 아이디어를 더하는 중...",
      "키워드를 분석하고 있어요...",
      "매력적인 문구를 생성 중...",
      "디자인 레이아웃을 구성 중...",
      "구매 전환율을 높이는 카피 생성 중...",
      "상품의 특징을 정리하고 있어요...",
      "고객 관점에서 내용을 다듬는 중...",
      "마케팅 요소를 강화하는 중...",
      "거의 다 완성되었어요!",
    ];
    let messageIndex = 0;

    // Timer cleanup function
    const clearAllTimers = () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
      if (completionTimeout) clearTimeout(completionTimeout);
      progressInterval = null;
      messageInterval = null;
      completionTimeout = null;
    };

    if (isGenerating) {
      clearAllTimers(); // Clear any existing timers

      // Reset loading state
      setLoadingProgress(0);
      setLoadingMessage(messages[0]); // Start with the first message
      messageIndex = 0;

      // Animation settings
      const animationDuration = 5000; // Target duration for 0-90%
      const interval = 30; // Update interval (ms)

      // Non-linear progress calculation (fast start, slow end)
      const calculateProgress = (elapsedTime: number, duration: number) => {
        const maxProgress = 90; // Cap progress at 90% before completion
        let t = Math.min(1, Math.max(0, elapsedTime / duration)); // Clamp t between 0 and 1

        // Custom curve: faster initial progress
        if (t < 0.3) {
          return (t / 0.3) * 50; // 0-50% in the first 30% of time
        } else {
          const progressInSection = (t - 0.3) / 0.7;
          return 50 + (progressInSection * 40); // 50-90% in the remaining 70% of time
        }
      };

      let startTime = Date.now(); // Start immediately

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = calculateProgress(elapsed, animationDuration);

        if (newProgress >= 90) {
          setLoadingProgress(90); // Stop at 90%
          if (progressInterval) clearInterval(progressInterval);
          progressInterval = null;
        } else {
          setLoadingProgress(newProgress);
        }
      }, interval);

      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 1500); // Change message every 1.5 seconds

    } else if (generatedContent && loadingProgress < 100) { // Only animate to 100% if content exists and not already 100%
      clearAllTimers(); // Clear generation timers

      setLoadingMessage("생성이 완료되었습니다!");

      const currentProgress = loadingProgress; // Capture current progress
      const remainingProgress = 100 - currentProgress;

      if (remainingProgress <= 0) return; // Already at 100%

      // Smoothly animate the remaining progress
      const completionDuration = 500; // Faster completion animation (0.5s)
      const startTime = Date.now();

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(1, elapsed / completionDuration);
        const easeOutRatio = 1 - Math.pow(1 - ratio, 3); // Ease-out cubic curve
        const newProgress = currentProgress + remainingProgress * easeOutRatio;

        if (ratio >= 1) {
          setLoadingProgress(100);
          if (progressInterval) clearInterval(progressInterval);
          progressInterval = null;

          // Optional: Reset loading state after a delay
          // completionTimeout = setTimeout(() => {
          //   setLoadingProgress(0); // Reset if needed
          //   setLoadingMessage(""); // Clear message
          // }, 1000);

        } else {
          setLoadingProgress(newProgress);
        }
      }, 16); // ~60fps updates
    } else if (!isGenerating && !generatedContent) {
        // If generation stopped without content (e.g., error), reset progress
        clearAllTimers();
        // Optionally reset progress, or keep it where it stopped
        // setLoadingProgress(0);
        // setLoadingMessage("생성 중단됨");
    }


    // Cleanup function to clear timers when component unmounts or dependencies change
    return () => {
      clearAllTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, generatedContent]); // Rerun effect when generation status or content changes

  return {
    loadingProgress,
    loadingMessage
  };
}
