import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 메서드입니다' });
  }

  try {
    // Supabase Google OAuth URL 생성
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${req.headers.origin}/app`,
      },
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // OAuth URL 반환
    return res.status(200).json({ url: data.url });
  } catch (error: any) {
    console.error('Google 로그인 오류:', error);
    return res.status(500).json({ error: error.message || 'Google 로그인 처리 중 오류가 발생했습니다' });
  }
}
