import React, { ReactNode } from 'react'
import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'

const AuthLayout = async ({children} : {children: ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();
  
    // If user is authenticated, redirect to home page
    if (isUserAuthenticated) redirect("/");
  return (
    <div className="auth-layout">{children}</div>
  )
}

export default AuthLayout;