import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = '상세 - AI 이커머스 상세페이지 초안 생성기',
  description = '상세로 이커머스 상세페이지 초안을 쉽고 빠르게 작성하세요.',
  showHeader = true,
  showFooter = true,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {showHeader && (
        <header className="border-b">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              상세
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                로그인
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                가입하기
              </Link>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-grow">
        {children}
      </main>

      {showFooter && (
        <footer className="border-t mt-auto">
          <div className="container mx-auto py-6 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">상세</h3>
                <p className="text-sm text-muted-foreground">
                  AI로 상세페이지 초안을 손쉽게 제작해보세요.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">링크</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                      홈
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">
                      가입하기
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                      로그인
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">문의</h3>
                <p className="text-sm text-muted-foreground">
                  문의사항이 있으시면 아래 이메일로 연락주세요.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  support@sangsae.com
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
              <p>&copy; 2025 상세. 모든 권리 보유.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
