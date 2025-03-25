import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NotFound: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          찾으시려는 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link href="/" passHref>
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

/*
  

*/