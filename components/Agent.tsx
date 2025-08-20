"use client"

import React, { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { createFeedback } from "@/lib/actions/general.action"

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
  interviewId?: string
  questions?: string[]
}

// Define the expected order of answers (only for generation flow)
const QUESTION_ORDER = ['intro', 'role', 'type', 'level', 'techstack', 'amount']

// Skip responses for generic answers
const skipResponses = [
  'yes', 'no', 'okay', 'ok', 'sure', 'alright', 'right', 'correct',
  'i understand', 'got it', 'sounds good', 'that works', 'perfect'
]

const Agent: React.FC<AgentProps> = ({ userName, userId, type, interviewId: propInterviewId, questions }) => {
  const router = useRouter()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [currentTranscript, setCurrentTranscript] = useState<string>("")
  const [currentSpeaker, setCurrentSpeaker] = useState<"user" | "assistant" | null>(null)
  const [vapiInstance, setVapiInstance] = useState<any>(null)
  const [interviewId, setInterviewId] = useState<string | null>(propInterviewId || null)
  const [lastMessage, setLastMessage] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const redirectExecuted = useRef(false)

  // Generation flow state (only used when type === "generate")
  const [answers, setAnswers] = useState({
    role: "",
    type: "",
    level: "",
    techstack: "",
    amount: ""
  })
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [apiCallMade, setApiCallMade] = useState(false)

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

  // Handle feedback generation for interview type
  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    console.log('Generating feedback for interview...');

    try {
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId: undefined, // Let the function generate a new ID
      });
      
      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log('Error saving feedback');
        router.push('/');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      router.push('/');
    }
  }

  // API call for generation flow only
  const makeAPICall = async (answersData: typeof answers) => {
    if (apiCallMade || type !== "generate") {
      console.log('API call already made or not generation type, skipping...');
      return;
    }
    
    setApiCallMade(true);
    
    try {
      console.log('🔥 EXECUTING API CALL NOW - Making questions generation call');
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
      setApiCallMade(false);
      
      if (vapiInstance) {
        try {
          await vapiInstance.stop();
        } catch (stopError) {
          console.error('Error stopping call after API failure:', stopError);
        }
      }
    }
  };

  // Process user answer (only for generation flow)
  const processUserAnswer = (answer: string) => {
    if (type !== "generate") return; // Only process answers for generation flow
    
    console.log('Processing answer:', answer, 'Current question index:', currentQuestionIndex);
    
    const normalizedAnswer = answer.toLowerCase().trim();
    if (skipResponses.some(skip => normalizedAnswer.includes(skip)) && normalizedAnswer.length < 20) {
      console.log('Skipping generic response:', answer);
      return;
    }
    
    setCurrentQuestionIndex(prevIndex => {
      console.log('Previous index:', prevIndex);
      
      if (prevIndex < QUESTION_ORDER.length) {
        const questionKey = QUESTION_ORDER[prevIndex] as keyof typeof answers;
        console.log('Setting answer for key:', questionKey, 'value:', answer);

        const newQuestionIndex = prevIndex + 1;
        console.log('New question index:', newQuestionIndex, 'Total questions:', QUESTION_ORDER.length);

        setAnswers(prevAnswers => {
          const updatedAnswers = {
            ...prevAnswers,
            [questionKey]: answer
          };
          
          console.log('Updated answers:', updatedAnswers);
          
          if (newQuestionIndex >= QUESTION_ORDER.length) {
            console.log('🎯 All questions answered! Final answers:', updatedAnswers);
            
            const allAnswersFilled = QUESTION_ORDER.every(key => 
              updatedAnswers[key as keyof typeof updatedAnswers]?.trim() !== ''
            );
            console.log('✅ All answers filled:', allAnswersFilled);
            
            if (allAnswersFilled) {
              console.log('🚀 Making API call in 2 seconds...');
              setTimeout(() => {
                makeAPICall(updatedAnswers);
              }, 2000);
            }
          }
          
          return updatedAnswers;
        });

        setUserAnswers(prev => [...prev, answer]);
        
        return newQuestionIndex;
      }
      
      return prevIndex;
    });
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
        console.log('🎉 Call started successfully')
        setCallStatus(CallStatus.ACTIVE)
        setMessages([])
        setCurrentTranscript("")
        setCurrentSpeaker(null)
        
        // Only reset generation state if this is a generation call
        if (type === "generate") {
          setAnswers({
            role: "",
            type: "",
            level: "",
            techstack: "",
            amount: ""
          })
          setCurrentQuestionIndex(0)
          setUserAnswers([])
          setApiCallMade(false)
          setInterviewId(null)
        }
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

            // Only process answers for generation flow
            if (message.role === "user" && message.transcript && type === "generate") {
              console.log('User message received for generation:', message.transcript)
              processUserAnswer(message.transcript)
            } else if (message.role === "user" && message.transcript && type === "interview") {
              console.log('User message received for interview:', message.transcript)
              // Just log the conversation - no processing needed for interviews
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

      // Event listeners
      instance.on("call-start", onCallStart)
      instance.on("call-end", onCallEnd)
      instance.on("message", onMessage)
      instance.on("speech-start", onSpeechStart)
      instance.on("speech-end", onSpeechEnd)
      instance.on("error", onError)

      return () => {
        instance.off("call-start", onCallStart)
        instance.off("call-end", onCallEnd)
        instance.off("message", onMessage)
        instance.off("speech-start", onSpeechStart)
        instance.off("speech-end", onSpeechEnd)
        instance.off("error", onError)
      }
    }

    initializeVapi()
  }, [type]) // Add type as dependency

  // Handle call finished - different logic for generation vs interview
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && !redirectExecuted.current) {
      redirectExecuted.current = true;
      
      if (type === 'generate') {
        console.log('Generate type finished - routing to home or interview page');
        // If we have an interviewId from the generation, go to that interview
        if (interviewId) {
          router.push(`/interview/${interviewId}`);
        } else {
          router.push('/');
        }
      } else if (type === 'interview') {
        console.log('Interview type finished - generating feedback');
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId, interviewId, router]);

  const handleCall = async () => {
    console.log('Starting call with type:', type, 'Questions:', questions)
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
        // Generation call - uses workflow to collect role, type, level, etc.
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!
        console.log('GENERATE CALL - Using workflow:', workflowId)
        
        await vapiInstance.start(workflowId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        })
      } else {
        // Interview call - uses assistant with the generated questions
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!
        
        let formattedQuestions = '';
        if (questions && questions.length > 0) {
          formattedQuestions = questions.map((question) => `- ${question}`).join('\n');
        }
        
        console.log('INTERVIEW CALL - Using assistant:', assistantId)
        console.log('Generated questions being passed:', formattedQuestions)
        
        await vapiInstance.start(assistantId, {
          variableValues: {
            questions: formattedQuestions,
            username: userName,
            userid: userId,
          },
        })
      }

      console.log('Call initiated successfully')

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
        return { text: "Redirecting...", className: "btn-call", onClick: () => {} }
      case CallStatus.EJECTED:
        return { text: "Start Call", className: "btn-start-call bg-green-500 hover:bg-green-600 text-white", onClick: handleCall }
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
          <div>Type: {type}</div>
          <div>Interview ID: {interviewId || 'Not set'}</div>
          <div>Questions: {questions?.length || 0}</div>
          <div>Redirect Executed: {redirectExecuted.current.toString()}</div>
          {type === "generate" && (
            <>
              <div>Question: {currentQuestionIndex + 1}/5</div>
              <div>API Call Made: {apiCallMade.toString()}</div>
              <div className="mt-1 max-h-20 overflow-auto">
                <div>Current Answers:</div>
                {QUESTION_ORDER.map((key, index) => (
                  <div key={key} className={`text-xs ${index < currentQuestionIndex ? 'text-green-400' : 'text-gray-400'}`}>
                    {key}: {answers[key as keyof typeof answers] || 'Not set'}
                  </div>
                ))}
              </div>
            </>
          )}
          {type === "interview" && questions && (
            <div className="mt-1 text-xs max-h-20 overflow-auto">
              <div>Interview Questions:</div>
              {questions.slice(0, 3).map((q, i) => (
                <div key={i} className="text-xs text-blue-400">
                  {i + 1}. {q.substring(0, 30)}...
                </div>
              ))}
              {questions.length > 3 && <div className="text-xs">...and {questions.length - 3} more</div>}
            </div>
          )}
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