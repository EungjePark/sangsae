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
    const { email, password } = req.body;

    // Supabase로 로그인 시도
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' });
    }

    // 성공 시 사용자 세션 정보 반환
    return res.status(200).json({ 
      user: data.user,
      session: data.session 
    });
  } catch (error: any) {
    console.error('로그인 오류:', error);
    return res.status(500).json({ error: error.message || '로그인 중 오류가 발생했습니다' });
  }
}
