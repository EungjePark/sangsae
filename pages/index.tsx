import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/main-layout';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <MainLayout
      title="상세 - 제품 상세페이지 AI 자동 생성 서비스"
      description="최신 AI 기술을 활용한 제품 상세페이지 자동 생성 서비스. 간단한 정보 입력으로 전문적인 상세페이지를 만들어보세요."
      showHeader={true}
      showFooter={true}
    >
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 모던 UX 방식 데모 섹션 - 핵심만 보여주는 버전 */}
      <section className="min-h-screen py-24 px-4 bg-[#0f0f0f] text-white relative overflow-hidden flex items-center">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="mb-8 text-[#ff68b4] font-mono">//BLUEPRINT</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 tracking-tight leading-tight">
                단 세 단계로<br />상세페이지 완성
              </h2>
              
              <div className="space-y-6 text-zinc-400">
                <div className="flex items-start gap-4">
                  <span className="h-8 w-8 rounded-full bg-[#ff68b4] text-white flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">상품 정보 입력</h3>
                    <p>상품명, 카테고리, 핵심 기능, 타겟 고객층 정보만 간단히 입력하세요.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="h-8 w-8 rounded-full bg-[#ff68b4] text-white flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">AI 생성 및 편집</h3>
                    <p>AI가 자동으로 최적화된 상세페이지를 생성합니다. 필요한 부분만 수정하세요.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="h-8 w-8 rounded-full bg-[#ff68b4] text-white flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">내보내기 및 적용</h3>
                    <p>PDF로 다운로드하거나 HTML 코드를 복사하여 쇼핑몰에 바로 적용하세요.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <Link href="/app" passHref>
                  <Button variant="outline" size="lg" className="border-[#ff68b4] text-[#ff68b4] hover:bg-[#ff68b4] hover:text-white py-6 px-10 text-lg font-bold tracking-wide">
                    지금 바로 시작하기
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 p-4 bg-zinc-900 rounded-lg border border-zinc-800 relative">
              <div className="w-full h-[400px] flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-[#ff68b4]/20 to-blue-500/20 rounded">
                <div className="text-white text-center">
                  <div className="text-6xl font-black text-[#ff68b4] mb-2">상세</div>
                  <div className="text-xl text-zinc-400">상세페이지 생성 솔루션</div>
                </div>
              </div>
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-[#ff68b4] rounded-full"></div>
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#ff68b4] rounded-full"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#ff68b4] rounded-full"></div>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-[#ff68b4] rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* 배경 그래픽 요소 */}
        <div className="absolute top-1/2 right-[-20%] md:right-[-10%] w-[600px] h-[600px] bg-[#ff68b4]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      </section>
    </MainLayout>
  );
};

export default Home;
