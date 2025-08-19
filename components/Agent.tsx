"use client"

import React, { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { vapi } from "@/lib/vapi.sdk" // Using the pre-configured instance

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
  const [interviewId, setInterviewId] = useState<string | null>(null)
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

      // Stop the call first
      await vapi.stop()
      setCallStatus(CallStatus.FINISHED)

      // Handle navigation based on API response
      if (result.success && result.interviewId) {
        console.log('Setting interview ID and navigating:', result.interviewId)
        setInterviewId(result.interviewId)

        // Navigate directly here after a short delay
        setTimeout(() => {
          console.log('Navigating to interview:', `/interview/${result.interviewId}`)
          router.push(`/interview/${result.interviewId}`)
        }, 3000)

      } else {
        console.error('No interview ID in response, redirecting to home:', result)
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }

    } catch (error) {
      console.error('API call failed:', error)
      // Stop call on error too
      await vapi.stop()
      setCallStatus(CallStatus.FINISHED)
      // Redirect to home on error
      setTimeout(() => {
        router.push("/")
      }, 3000)
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
      // Use the imported vapi instance directly - no need to create a new one
      console.log('Initializing VAPI event listeners...')

      const onCallStart = () => {
        console.log('✅ Call started successfully')
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
      }

      const onCallEnd = () => {
        console.log('📞 Call ended')
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
        console.error("❌ VAPI Error with details:", {
          error,
          message: error.message,
          stack: error.stack,
          name: error.name,
          timestamp: new Date().toISOString()
        })
        setCallStatus(CallStatus.INACTIVE)
        setCurrentTranscript("")
        setCurrentSpeaker(null)

        alert(`VAPI Error: ${error.message || 'Unknown error occurred'}`)
      }

      const onCallStartProgress = (event: any) => {
        console.log('🔄 Call start progress:', event)
      }

      const onCallStartSuccess = (event: any) => {
        console.log('🎉 Call start success:', event)
      }

      const onCallStartFailed = (event: any) => {
        console.error('💥 Call start failed with details:', {
          event,
          timestamp: new Date().toISOString()
        })
        setCallStatus(CallStatus.INACTIVE)

        if (event?.error?.message) {
          alert(`Call failed: ${event.error.message}`)
        } else {
          alert('Call failed to start. Please check your configuration and try again.')
        }
      }

      // Use the imported vapi instance for event listeners
      vapi.on("call-start", onCallStart)
      vapi.on("call-end", onCallEnd)
      vapi.on("message", onMessage)
      vapi.on("speech-start", onSpeechStart)
      vapi.on("speech-end", onSpeechEnd)
      vapi.on("error", onError)
      vapi.on("call-start-progress", onCallStartProgress)
      vapi.on("call-start-success", onCallStartSuccess)
      vapi.on("call-start-failed", onCallStartFailed)

      return () => {
        vapi.off("call-start", onCallStart)
        vapi.off("call-end", onCallEnd)
        vapi.off("message", onMessage)
        vapi.off("speech-start", onSpeechStart)
        vapi.off("speech-end", onSpeechEnd)
        vapi.off("error", onError)
        vapi.off("call-start-progress", onCallStartProgress)
        vapi.off("call-start-success", onCallStartSuccess)
        vapi.off("call-start-failed", onCallStartFailed)
      }
    }

    initializeVapi()
  }, [])

  // Enhanced handleCall function using imported vapi
  const handleCall = async () => {
    const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID || "6595dd69-a7a1-4034-a926-a8d8ecb6d08a"
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "fd07d3b3-0b58-4789-8120-2885e5adc4a9"

    console.log('🐛 Enhanced Pre-call debug:')
    console.log('- Workflow ID:', workflowId)
    console.log('- Assistant ID:', assistantId)
    console.log('- Type:', type)
    console.log('- Username:', userName)
    console.log('- User ID:', userId)
    console.log('- VAPI Instance available:', !!vapi)

    // Validate required environment variables and IDs
    if (type === "generate" && !workflowId) {
      console.error('❌ WORKFLOW_ID is missing!')
      alert('Environment variable NEXT_PUBLIC_VAPI_WORKFLOW_ID is not set!')
      return
    }

    if (type !== "generate" && !assistantId) {
      console.error('❌ ASSISTANT_ID is missing!')
      alert('Environment variable NEXT_PUBLIC_VAPI_ASSISTANT_ID is not set!')
      return
    }

    setCallStatus(CallStatus.CONNECTING)

    try {
      // Stop any existing call first
      console.log('🛑 Stopping any existing calls...')
      await vapi.stop()
    } catch (error) {
      console.log('ℹ️ No existing call to stop:', error)
    }

    const callConfig = {
      variableValues: {
        username: userName,
        userid: userId,
      },
    }

    console.log('🚀 Starting VAPI call with config:', {
      type,
      id: type === "generate" ? workflowId : assistantId,
      config: callConfig
    })

    try {
      if (type === "generate") {
        console.log('📞 Starting workflow call with ID:', workflowId)
        await vapi.start(workflowId, callConfig)
      } else {
        console.log('📞 Starting assistant call with ID:', assistantId)
        await vapi.start(assistantId, callConfig)
      }
      console.log('✅ VAPI start call completed successfully')
    } catch (error: any) {
      console.error('❌ Call failed with detailed error:', {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      setCallStatus(CallStatus.INACTIVE)

      // More specific error handling
      if (error.message?.includes('400')) {
        alert('Call failed: Invalid request. Please check your VAPI configuration.')
      } else if (error.message?.includes('401')) {
        alert('Call failed: Unauthorized. Please check your VAPI token.')
      } else if (error.message?.includes('403')) {
        alert('Call failed: Forbidden. Please check your account permissions.')
      } else {
        alert(`Call failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const handleDisconnect = async () => {
    try {
      await vapi.stop()
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