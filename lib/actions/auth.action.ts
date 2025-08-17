'use server';

import { cookies } from 'next/headers';
import { db, auth } from '@/firebase/admin';

const ONE_WEEK = 60 * 60 * 24 * 7 * 1000; // constant for 1 week to make things easier to read

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: "User already exists. Please try signing in."
            }
        }

        await db.collection('users').doc(uid).set({
            name,
            email
        });
        
        return {
            success: true,
            message: "User created successfully."
        };

    } catch (e: any) {
        console.error("Error creating user", e);

        if (e.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: "Email already exists. Please try signing in."
            }
        }

        return {
            success: false,
            message: 'Failed to create user. Please try again later.'
        }
    }
}

export async function signIn(params: SignInParams) {
    const { email, idtoken } = params;
    
    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return {
                success: false,
                message: "User not found. Please sign up."
            }
        }

        await setSessionCookie(idtoken);

        return {
            success: true,
            message: "Signed in successfully."
        };

    } catch (e: any) {
        console.log(e);

        return {
            success: false,
            message: 'Failed to sign in. Please try again later.'
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK, // this will expire in a week
    });

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });
}
