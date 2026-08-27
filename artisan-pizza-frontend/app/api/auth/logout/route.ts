import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (token) {
    // Best-effort: tell Laravel to revoke the token
    await fetch(`${BACKEND}/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }).catch(() => {});
  }

  const response = NextResponse.json({ message: 'Logged out.' });
  response.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' });
  return response;
}
