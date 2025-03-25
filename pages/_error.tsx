import React from 'react';
import { NextPage } from 'next';

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          {statusCode
            ? `${statusCode} - 서버 오류가 발생했습니다`
            : '클라이언트 오류가 발생했습니다'}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          죄송합니다. 문제가 발생했습니다.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
