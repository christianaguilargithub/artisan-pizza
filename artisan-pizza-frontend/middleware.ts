import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // Only inject on proxied backend API calls, not on our own Next.js API routes
  if (req.nextUrl.pathname.startsWith('/api/v1') && token) {
    const headers = new Headers(req.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return NextResponse.rewrite(req.nextUrl, { request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};
