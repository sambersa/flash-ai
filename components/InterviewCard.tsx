import React from 'react'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { interviewCovers } from '@/constants'
import DisplayTechIcons from './DisplayTechIcons'

const getRandomInterviewCover = () => {
  return interviewCovers[Math.floor(Math.random() * interviewCovers.length)];
};

const InterviewCard = ({ interviewId, userId, role, type, techstack, createdAt }: InterviewCardProps) => {
  const feedback = null as Feedback | null
  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type
  const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY')

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview p-4">
        <div className="space-y-4">
          {/* Badge stays absolutely positioned */}
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-fit px-5 py-3 rounded-bl-lg bg-light-600">
              <p className="badge-text text-sm font-medium">{normalizedType}</p>
            </div>

            {/* Add extra padding top so content starts lower */}
            <div className="flex flex-col items-center space-y-2 pt-8">
              <Image
                src={getRandomInterviewCover()}
                alt="cover image"
                width={90}
                height={90}
                className="rounded-full object-cover w-[90px] h-[90px]"
              />
              <h3 className="text-xl font-semibold capitalize text-center">
                {role} Interview
              </h3>
            </div>
          </div>

          {/* Date and Score Section */}
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/calendar.svg"
                alt="calendar icon"
                width={22}
                height={22}
              />
              <p className="text-sm">{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/star.svg"
                alt="star"
                width={22}
                height={22}
              />
              <p className="text-sm font-medium">{feedback?.totalScore || '---'}/100</p>
            </div>
          </div>

          {/* Assessment Text */}
          <div>
            <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
              {feedback?.finalAssessment ||
                'You have not taken the interview yet. Take it now to improve your skills!'}
            </p>
          </div>

          {/* Bottom Section with Tech Icons and Button */}
          <div className="flex flex-row justify-between items-center">
            <DisplayTechIcons techStack={techstack} />

            <Button className="btn-primary">
              <Link
                href={
                  feedback
                    ? `/interview/${interviewId}/feedback`
                    : `/interview/${interviewId}`
                }
              >
                {feedback ? 'Check Feedback' : 'View Interview'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard