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
    // Supabase 로그아웃 처리
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 로그아웃 성공
    return res.status(200).json({ message: '로그아웃 성공' });
  } catch (error: any) {
    console.error('로그아웃 오류:', error);
    return res.status(500).json({ error: error.message || '로그아웃 중 오류가 발생했습니다' });
  }
}
