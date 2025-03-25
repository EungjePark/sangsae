import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignUp: NextPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'free'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 무료 플랜인 경우 로그인 페이지로 이동
    if (formData.plan === 'free') {
      window.location.href = '/login';
      return;
    }
    
    // 유료 플랜인 경우 결제 페이지로 이동
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('결제 세션 생성 실패:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Head>
        <title>회원가입 - DetailCraft</title>
        <meta name="description" content="DetailCraft에 가입하고 AI 상세페이지 생성을 시작하세요." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Link href="/" className="absolute top-8 left-8 text-xl font-bold">
        DetailCraft
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>
            DetailCraft 계정을 만들고 상세페이지 생성을 시작하세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="홍길동" 
                required 
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="hello@example.com" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">요금제 선택</Label>
              <select 
                id="plan" 
                name="plan" 
                className="flex h-10 w-full rounded-md border border-[#ff68b4] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff68b4] focus-visible:ring-offset-2"
                value={formData.plan}
                onChange={handleChange}
              >
                <option value="free">무료 플랜</option>
                <option value="premium">프리미엄 (₩10,000/월)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {formData.plan === 'free' ? '가입하기' : '결제하기'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          로그인
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
