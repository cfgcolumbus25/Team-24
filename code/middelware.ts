/*for passing auth toekn to backend*/
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

export async function middleware(request: NextRequest) {
    //only check authentication for admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        //skip auth check for login and register pages
        if (request.nextUrl.pathname === '/admin/login' ||
            request.nextUrl.pathname === '/admin/register') {
            return NextResponse.next()
        }

        const sessionToken = request.cookies.get('session_token')?.value

        if (!sessionToken) {
            //no token, redirect to login
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        //verify token with backend
        try {
            const response = await fetch(`${BACKEND_URL}/api/profile`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            })

            if (!response.ok) {
                //invalid token, clear cookie and redirect to login
                const response = NextResponse.redirect(new URL('/admin/login', request.url))
                response.cookies.delete('session_token')
                return response
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            //on error, allow request but log the issue
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*'
}