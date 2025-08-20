import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
    const { type, role, level, techstack, amount, userid } = await request.json();

    // Log incoming request for debugging
    console.log("POST /api/vapi/generate request body:", {
        type,
        role,
        level,
        techstack,
        techstackType: typeof techstack,
        amount,
        userid,
    });

    // Validate inputs
    if (!type || !role || !level || !amount) {
        return Response.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
        );
    }

    try {
        const { text: questions } = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]

Thank you! <3`,
        });

        // Safely parse techstack as an array of strings
        const techstackArray = (() => {
            if (Array.isArray(techstack)) {
                return techstack.map(t => String(t).trim()).filter(t => t);
            }
            if (typeof techstack === "string" && techstack.trim()) {
                return techstack.split(",").map(t => t.trim()).filter(t => t);
            }
            console.warn("Invalid techstack value:", techstack, "Type:", typeof techstack);
            return [];
        })();

        // Safely parse questions JSON
        let parsedQuestions: string[] = [];
        try {
            parsedQuestions = JSON.parse(questions);
            if (!Array.isArray(parsedQuestions)) parsedQuestions = [];
        } catch (err) {
            console.error("Failed to parse AI questions:", questions, err);
            // If parsing fails, return empty array to prevent crash
            parsedQuestions = [];
        }

        const interview: any = {
            role,
            type,
            level,
            techstack: techstackArray,
            questions: parsedQuestions,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        if (userid !== undefined) {
            interview.userId = userid ?? null;
        }

        console.log("Interview object to save:", interview);

        // Save to database ONCE and return the result
        const docRef = await db.collection("interviews").add(interview);
        console.log("Interview saved with ID:", docRef.id);

        // Return the interview ID in the response
        return Response.json({
            success: true,
            interviewId: docRef.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error in POST /api/vapi/generate:", error);
        return Response.json(
            { success: false, error: error.message || String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}