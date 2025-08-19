"use client"

import React, { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { vapi } from "@/lib/vapi.sdk"

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
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
  const [interviewId, setInterviewId] = useState<string | null>(null) // ADD THIS
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
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

  const makeAPICall = async (answersData: typeof answers) => {
    try {
      console.log('Making API call with data:', answersData)
      
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
          userid: userId
        })
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('API call successful:', result)
      
      // CAPTURE THE INTERVIEW ID FROM THE RESPONSE
      if (result.success && result.interviewId) {
        console.log('Setting interview ID:', result.interviewId)
        setInterviewId(result.interviewId)
      } else {
        console.error('No interview ID in response:', result)
      }
      
      if (vapiInstance) {
        await vapiInstance.stop()
        setCallStatus(CallStatus.FINISHED)
      }
      
    } catch (error) {
      console.error('API call failed:', error)
    }
  }

  const processUserAnswer = (answer: string) => {
    if (currentQuestionIndex < QUESTION_ORDER.length) {
      const questionKey = QUESTION_ORDER[currentQuestionIndex] as keyof typeof answers
      
      setAnswers(prev => ({
        ...prev,
        [questionKey]: answer
      }))
      
      setUserAnswers(prev => [...prev, answer])
      setCurrentQuestionIndex(prev => prev + 1)
      
      if (currentQuestionIndex + 1 >= QUESTION_ORDER.length) {
        const finalAnswers = {
          ...answers,
          [questionKey]: answer
        }
        console.log('All questions answered:', finalAnswers)
        
        setTimeout(() => {
          makeAPICall(finalAnswers)
        }, 2000)
      }
    }
  }

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
        console.log('Call started')
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
        setInterviewId(null) // Reset interview ID
      }
      
      const onCallEnd = () => {
        console.log('Call ended')
        setCallStatus(CallStatus.FINISHED)
        setCurrentTranscript("")
        setCurrentSpeaker(null)
      }

      const onMessage = (message: Message) => {
        console.log('VAPI Message received:', message)
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
              processUserAnswer(message.transcript)
            }
          }
        }
      }

      const onSpeechStart = () => {
        console.log('Speech started')
        setIsSpeaking(true)
      }
      
      const onSpeechEnd = () => {
        console.log('Speech ended')
        setIsSpeaking(false)
      }

      const onError = (error: Error) => {
        console.error("VAPI Error:", error)
        setCallStatus(CallStatus.INACTIVE)
        setCurrentTranscript("")
        setCurrentSpeaker(null)
      }

      // Add more VAPI event listeners for debugging
      const onCallStartProgress = (event: any) => {
        console.log('Call start progress:', event)
      }

      const onCallStartSuccess = (event: any) => {
        console.log('Call start success:', event)
      }

      const onCallStartFailed = (event: any) => {
        console.error('Call start failed:', event)
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

  // UPDATED NAVIGATION LOGIC
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      console.log('Call finished, interview ID:', interviewId)
      setTimeout(() => {
        if (interviewId) {
          console.log('Navigating to interview:', `/interview/${interviewId}`)
          router.push(`/interview/${interviewId}`)
        } else {
          console.log('No interview ID, redirecting to home')
          router.push("/")
        }
      }, 3000)
    }
  }, [callStatus, router, interviewId]) // Added interviewId to dependencies

  const handleCall = async () => {
    if (!vapiInstance) {
      console.error('Vapi instance not initialized')
      return
    }

    try {
      await vapiInstance.stop()
    } catch {}

    setCallStatus(CallStatus.CONNECTING)
    
    // Enhanced logging for debugging
    console.log('Starting VAPI call with config:', {
      type,
      workflowId: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
      assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
      userName,
      userId
    })
    
    try {
      if (type === "generate") {
        console.log('Starting workflow call with ID:', process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID)
        await vapiInstance.start(
          undefined, // assistant
          undefined, // assistantOverrides  
          undefined, // squad
          process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, // workflow
          { // workflowOverrides
            variableValues: {
              username: userName,
              userid: userId,
            },
          }
        )
      } else {
        console.log('Starting assistant call with ID:', process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID)
        await vapiInstance.start(
          process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, // assistant
          { // assistantOverrides
            variableValues: {
              username: userName,
              userid: userId,
            },
          }
        )
      }
      console.log('VAPI start call completed')
    } catch (error) {
      console.error('Call failed:', error)
      setCallStatus(CallStatus.INACTIVE)
    }
  }

  const handleDisconnect = async () => {
    if (!vapiInstance) return
    try {
      await vapiInstance.stop()
      setCallStatus(CallStatus.FINISHED)
    } catch (error) {
      setCallStatus(CallStatus.INACTIVE)
    }
  }

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

      {callStatus === CallStatus.ACTIVE && (currentTranscript || messages.length > 0) && (
        <div className="transcript-border">
          <div className="bg-gray-800 rounded-lg p-4 mx-4 mb-4">
            <p className="text-white text-center text-sm leading-relaxed">
              {currentTranscript ? (
                <>
                  {currentTranscript}
                  <span className="animate-pulse ml-1">|</span>
                </>
              ) : messages.length > 0 ? (
                messages[messages.length - 1].content
              ) : (
                "Listening..."
              )}
            </p>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div>Status: {callStatus}</div>
          <div>Question: {currentQuestionIndex + 1}/5</div>
          <div>Interview ID: {interviewId || 'Not set'}</div>
          <div>Type: {type}</div>
          <div className="mt-2 text-xs">
            <div>Workflow ID: {process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID}</div>
            <div>Assistant ID: {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}</div>
          </div>
          <div className="mt-1 max-h-20 overflow-auto">
            Answers: {JSON.stringify(answers, null, 1)}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            {callStatus === CallStatus.CONNECTING && (
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-75"></span>
            )}
            <span className="relative z-10">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : "Connecting..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End Call
          </button>
        )}
      </div>
    </>
  )
}

export default Agent