"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const Agent = ({ userName }: any) => {
    const isSpeaking = true;
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const messages = [
        'What is your name?',
        'My name is Sam, nice to meet you.',
    ];
    const lastMessage = messages[messages.length - 1];

    const handleCallAction = () => {
        if (callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED) {
            setCallStatus(CallStatus.CONNECTING);
            // Simulate connection process
            setTimeout(() => setCallStatus(CallStatus.ACTIVE), 1000);
        } else if (callStatus === CallStatus.ACTIVE) {
            setCallStatus(CallStatus.FINISHED);
        }
    };

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
                        {isSpeaking && <span className="animate-speak"></span>}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button onClick={handleCallAction} className="relative btn-call">
                        {/* Ping animation - only show when connecting */}
                        {callStatus === CallStatus.CONNECTING && (
                            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-75"></span>
                        )}
                        {/* Button text */}
                        <span className="relative z-10">
                            {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED ? 'Call' : 'Connecting...'}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleCallAction}>
                        End Call
                    </button>
                )}
            </div>
        </>
    )
}

export default Agent
