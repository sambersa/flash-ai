"use client"

import React, { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  EJECTED = "EJECTED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant"
  content: string
  timestamp: number
}

interface Message {
  type: string
  transcriptType?: string
  role: "user" | "system" | "assistant"
  transcript?: string
}

interface AgentProps {
  userName: string
  userId: string
  type: string
}

// Define the expected order of answers
const QUESTION_ORDER = ['role', 'type', 'level', 'techstack', 'amount']

const Agent: React.FC<AgentProps> = ({ userName, userId, type }) => {
  const router = useRouter()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [currentTranscript, setCurrentTranscript] = useState<string>("")
  const [currentSpeaker, setCurrentSpeaker] = useState<"user" | "assistant" | null>(null)
  const [vapiInstance, setVapiInstance] = useState<any>(null)
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const redirectExecuted = useRef(false)

  const [answers, setAnswers] = useState({
    role: "",
    type: "",
    level: "",
    techstack: "",
    amount: ""
  })
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentTranscript])

  // Update last message when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  const makeAPICall = async (answersData: typeof answers) => {
    try {
      console.log('Making API call with data:', answersData);

      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: answersData.role,
          type: answersData.type,
          level: answersData.level,
          techstack: answersData.techstack,
          amount: answersData.amount,
          userid: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (result.success && result.interviewId) {
        console.log('Setting interview ID:', result.interviewId);
        setInterviewId(result.interviewId);
        
        if (vapiInstance) {
          console.log('Stopping VAPI call...');
          await vapiInstance.stop();
        }
      } else {
        console.error('API call succeeded but no interview ID in response:', result);
        setInterviewId(null);
        
        if (vapiInstance) {
          await vapiInstance.stop();
        }
      }
    } catch (error) {
      console.error('API call failed:', error);
      setInterviewId(null);
      
      if (vapiInstance) {
        try {
          await vapiInstance.stop();
        } catch (stopError) {
          console.error('Error stopping call after API failure:', stopError);
        }
      }
    }
  };

  const processUserAnswer = (answer: string) => {
    console.log('Processing answer:', answer, 'Current question index:', currentQuestionIndex);
    
    // Use functional update to ensure we have the latest state
    setCurrentQuestionIndex(prevIndex => {
      console.log('Previous index:', prevIndex);
      
      if (prevIndex < QUESTION_ORDER.length) {
        const questionKey = QUESTION_ORDER[prevIndex] as keyof typeof answers;
        console.log('Setting answer for key:', questionKey, 'value:', answer);

        // Calculate new index here where it's in scope
        const newQuestionIndex = prevIndex + 1;
        console.log('New question index:', newQuestionIndex, 'Total questions:', QUESTION_ORDER.length);

        // Update answers
        setAnswers(prevAnswers => {
          const updatedAnswers = {
            ...prevAnswers,
            [questionKey]: answer
          };
          
          console.log('Updated answers:', updatedAnswers);
          
          // Check if all questions are answered
          if (newQuestionIndex >= QUESTION_ORDER.length) {
            console.log('All questions answered! Final answers:', updatedAnswers);
            
            const allAnswersFilled = QUESTION_ORDER.every(key => 
              updatedAnswers[key as keyof typeof updatedAnswers]?.trim() !== ''
            );
            console.log('All answers filled:', allAnswersFilled);
            
            if (allAnswersFilled) {
              console.log('Making API call in 2 seconds...');
              setTimeout(() => {
                console.log('Executing API call now with:', updatedAnswers);
                makeAPICall(updatedAnswers);
              }, 2000);
            } else {
              console.error('Some answers are missing:', updatedAnswers);
            }
          }
          
          return updatedAnswers;
        });

        // Update user answers
        setUserAnswers(prev => [...prev, answer]);
        
        return newQuestionIndex;
      }
      
      return prevIndex;
    });
  };

  // Handle routing to home
  const handleRouteToHome = () => {
    console.log('Routing to home page');
    router.push('/');
  };

  useEffect(() => {
    const initializeVapi = async () => {
      const publicKey = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN
      if (!publicKey) {
        console.error('Missing VAPI public key')
        return
      }

      const Vapi = (await import('@vapi-ai/web')).default
      const instance = new Vapi(publicKey)
      setVapiInstance(instance)

      const onCallStart = () => {
        console.log('🎉 Call started successfully - transitioning to ACTIVE state')
        setCallStatus(CallStatus.ACTIVE)
        setMessages([])
        setCurrentTranscript("")
        setCurrentSpeaker(null)
        setAnswers({
          role: "",
          type: "",
          level: "",
          techstack: "",
          amount: ""
        })
        setCurrentQuestionIndex(0)
        setUserAnswers([])
        setInterviewId(null)
        redirectExecuted.current = false
      }

      const onCallEnd = () => {
        console.log('Call ended - setting status to FINISHED');
        setCallStatus(CallStatus.FINISHED);
        setCurrentTranscript("");
        setCurrentSpeaker(null);
        setIsSpeaking(false);
      }

      const onMessage = (message: Message) => {
        console.log('📩 VAPI Message received:', {
          type: message.type,
          role: message.role,
          transcriptType: message.transcriptType,
          content: message.transcript?.substring(0, 50) + '...'
        })

        if (message.type === "transcript") {
          if (message.transcriptType === "partial") {
            setCurrentTranscript(message.transcript || "")
            setCurrentSpeaker(message.role)
          } else if (message.transcriptType === "final") {
            const newMessage: SavedMessage = {
              role: message.role,
              content: message.transcript || "",
              timestamp: Date.now()
            }
            setMessages((prevMessages) => [...prevMessages, newMessage])
            setCurrentTranscript("")
            setCurrentSpeaker(null)

            if (message.role === "user" && message.transcript) {
              console.log('Processing user answer:', message.transcript)
              processUserAnswer(message.transcript)
            }
          }
        }
      }

      const onSpeechStart = () => {
        console.log('🎤 Speech started')
        setIsSpeaking(true)
      }

      const onSpeechEnd = () => {
        console.log('🔇 Speech ended')
        setIsSpeaking(false)
      }

      const onError = (error: Error) => {
        console.error("VAPI Error:", error)
        if (error.message.includes('ejection') || error.message.includes('Meeting has ended') || error.message.includes('call ejected')) {
          console.log('Call ejected - setting status to EJECTED');
          setCallStatus(CallStatus.EJECTED);
        } else {
          setCallStatus(CallStatus.INACTIVE);
          alert(`VAPI Error: ${error.message || 'Unknown error occurred'}`);
        }
        setCurrentTranscript("")
        setCurrentSpeaker(null)
        setIsSpeaking(false)
      }

      const onCallStartProgress = (event: any) => {
        console.log('Call progress:', event.stage, event.status)
      }

      const onCallStartSuccess = (event: any) => {
        console.log('Call start success event received:', event)
        if (callStatus === CallStatus.CONNECTING) {
          console.log('Manually transitioning to ACTIVE from success event')
          setCallStatus(CallStatus.ACTIVE)
        }
      }

      const onCallStartFailed = (event: any) => {
        console.error('Call start failed:', event)
        setCallStatus(CallStatus.INACTIVE)
        alert(`Call failed: ${event.error?.message || 'Unknown error'}`)
      }

      instance.on("call-start", onCallStart)
      instance.on("call-end", onCallEnd)
      instance.on("message", onMessage)
      instance.on("speech-start", onSpeechStart)
      instance.on("speech-end", onSpeechEnd)
      instance.on("error", onError)
      instance.on("call-start-progress", onCallStartProgress)
      instance.on("call-start-success", onCallStartSuccess)
      instance.on("call-start-failed", onCallStartFailed)

      return () => {
        instance.off("call-start", onCallStart)
        instance.off("call-end", onCallEnd)
        instance.off("message", onMessage)
        instance.off("speech-start", onSpeechStart)
        instance.off("speech-end", onSpeechEnd)
        instance.off("error", onError)
        instance.off("call-start-progress", onCallStartProgress)
        instance.off("call-start-success", onCallStartSuccess)
        instance.off("call-start-failed", onCallStartFailed)
      }
    }

    initializeVapi()
  }, [])

  // Handle redirect logic
  useEffect(() => {
    console.log('Redirect useEffect triggered:', { callStatus, interviewId, redirectExecuted: redirectExecuted.current });
    
    if (callStatus === CallStatus.FINISHED && !redirectExecuted.current) {
      redirectExecuted.current = true;
      
      const performRedirect = () => {
        try {
          if (type === "generate") {
            console.log('Generate type - routing to home');
            router.push('/');
          } else if (interviewId && typeof interviewId === 'string' && interviewId.trim() !== '') {
            console.log('Call finished, navigating to interview:', `/interview/${interviewId}`);
            router.push(`/interview/${interviewId}`);
          } else {
            console.log('No interview ID, routing to home');
            router.push('/');
          }
        } catch (error) {
          console.error('Redirect failed:', error);
          router.push('/');
        }
      };
      
      const redirectTimer = setTimeout(performRedirect, 1000);
      
      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [callStatus, interviewId, router, type]);

  const handleCall = async () => {
    const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID || "6595dd69-a7a1-4034-a926-a8d8ecb6d08a"
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "fd07d3b3-0b58-4789-8120-2885e5adc4a9"

    console.log('Starting call with Method 2')
    setCallStatus(CallStatus.CONNECTING)
    redirectExecuted.current = false

    try {
      if (vapiInstance) {
        await vapiInstance.stop()
      }
    } catch (error) {
      console.log('No existing call to stop')
    }

    try {
      if (type === "generate") {
        await vapiInstance.start(undefined, undefined, undefined, workflowId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        })
      } else {
        await vapiInstance.start(assistantId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        })
      }

      console.log('Call initiated successfully')

      // Fallback timeout logic
      let fallbackTimeout = setTimeout(() => {
        console.log('FALLBACK: Call-start event did not fire, checking if call is actually active...')
        if (callStatus === CallStatus.CONNECTING) {
          console.log('Manually transitioning to ACTIVE state (fallback)')
          setCallStatus(CallStatus.ACTIVE)
        }
      }, 8000)

      const clearFallback = () => {
        if (fallbackTimeout) {
          clearTimeout(fallbackTimeout)
          fallbackTimeout = null
        }
      }

      const tempListener = (message: any) => {
        if (message.type === "transcript" || message.type === "speech-start") {
          console.log('Call is definitely active (received message/speech), clearing fallback')
          clearFallback()
          setCallStatus(CallStatus.ACTIVE)
        }
      }

      vapiInstance.on("message", tempListener)

      setTimeout(() => {
        vapiInstance.off("message", tempListener)
        clearFallback()
      }, 30000)

    } catch (error: any) {
      console.error('Call failed:', error)
      setCallStatus(CallStatus.INACTIVE)
      alert(`Call failed: ${error.message}`)
    }
  }

  const handleDisconnect = async () => {
    if (!vapiInstance) return
    try {
      await vapiInstance.stop()
    } catch (error) {
      console.error('Error disconnecting:', error)
      setCallStatus(CallStatus.INACTIVE)
    }
  }

  // Function to get button text and style
  const getButtonConfig = () => {
    switch (callStatus) {
      case CallStatus.INACTIVE:
        return { text: "Call", className: "btn-call", onClick: handleCall }
      case CallStatus.CONNECTING:
        return { text: "Connecting...", className: "btn-call", onClick: handleCall }
      case CallStatus.ACTIVE:
        return { text: "End Call", className: "btn-disconnect", onClick: handleDisconnect }
      case CallStatus.FINISHED:
        return interviewId 
          ? { text: "Redirecting...", className: "btn-call", onClick: () => {} }
          : { text: "Start Call", className: "btn-start-call bg-green-500 hover:bg-green-600 text-white", onClick: handleRouteToHome }
      case CallStatus.EJECTED:
        return { text: "Start Call", className: "btn-start-call bg-green-500 hover:bg-green-600 text-white", onClick: handleRouteToHome }
      default:
        return { text: "Call", className: "btn-call", onClick: handleCall }
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak"></span>}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
              priority
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Show transcript when call is active and there's content */}
      {callStatus === CallStatus.ACTIVE && (currentTranscript || lastMessage) && (
        <div className="transcript-border">
          <div className="transcript">
            <p 
              className={cn(
                "transition-opacity duration-500",
                currentTranscript ? "opacity-100" : "opacity-100 animate-fadeIn"
              )}
            >
              {currentTranscript ? (
                <>
                  {currentTranscript}
                  <span className="animate-pulse ml-1">|</span>
                </>
              ) : (
                lastMessage || "Listening..."
              )}
            </p>
          </div>
        </div>
      )}

      {/* Development debug panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div>Status: {callStatus}</div>
          <div>Question: {currentQuestionIndex + 1}/5</div>
          <div>Interview ID: {interviewId || 'Not set'}</div>
          <div>Type: {type}</div>
          <div>Redirect Executed: {redirectExecuted.current.toString()}</div>
          <div className="mt-2 text-xs">
            <div>Workflow ID: {process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID}</div>
            <div>Assistant ID: {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}</div>
          </div>
          <div className="mt-1 max-h-20 overflow-auto">
            <div>Current Answers:</div>
            {QUESTION_ORDER.map((key, index) => (
              <div key={key} className={`text-xs ${index < currentQuestionIndex ? 'text-green-400' : 'text-gray-400'}`}>
                {key}: {answers[key as keyof typeof answers] || 'Not set'}
              </div>
            ))}
          </div>
          <div className="mt-1 text-xs">
            User Answers Count: {userAnswers.length}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        <button 
          className={cn("relative", buttonConfig.className)}
          onClick={buttonConfig.onClick}
        >
          {callStatus === CallStatus.CONNECTING && (
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-75"></span>
          )}
          <span className="relative z-10">
            {buttonConfig.text}
          </span>
        </button>
      </div>
    </>
  )
}

export default Agent