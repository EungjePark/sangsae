import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Stripe 초기화
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 메서드입니다' });
  }

  try {
    const { name, email, plan } = req.body;

    // 프론트엔드에서 무료 플랜을 선택했는지 확인
    if (plan === 'free') {
      return res.status(400).json({ error: '무료 플랜은 결제가 필요하지 않습니다' });
    }

    // Stripe 결제 세션 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: 'DetailCraft 프리미엄',
              description: '월간 구독',
            },
            unit_amount: 10000, // 10,000원
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/login?success=true`,
      cancel_url: `${req.headers.origin}/signup?canceled=true`,
      customer_email: email,
      metadata: {
        name,
        plan,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe 세션 생성 오류:', error);
    res.status(500).json({ error: error.message || '결제 세션 생성 중 오류가 발생했습니다' });
  }
}
