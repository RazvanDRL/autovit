import CSRF from 'csrf';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const csrf = new CSRF();

export function middleware(request: NextRequest) {
  // Skip CSRF check for GET requests and non-mutation endpoints
  if (request.method === 'GET') {
    return NextResponse.next();
  }

  const csrfToken = request.headers.get('X-CSRF-Token');
  const sessionToken = request.cookies.get('session')?.value;

  if (!csrfToken || !sessionToken) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid CSRF token' }), 
      { status: 403 }
    );
  }

  try {
    if (csrf.verify(sessionToken, csrfToken)) {
      return NextResponse.next();
    }
  } catch (error) {
    console.error('CSRF verification failed:', error);
  }

  return new NextResponse(
    JSON.stringify({ error: 'Invalid CSRF token' }), 
    { status: 403 }
  );
}

export const config = {
  matcher: [
    // Add routes that need CSRF protection
    '/api/:path*',
    '/adauga/:path*',
    '/complete-profile/:path*'
  ]
}; 