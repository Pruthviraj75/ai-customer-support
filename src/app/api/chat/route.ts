import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function POST(req:NextRequest) {
    try {
        const {message, ownerId} = await req.json()
        if(!message || !ownerId){
            return NextResponse.json(
                {message: "message and owner id is required"},
                {status:400, headers: corsHeaders }
            )
        }
        await connectDb()
        const setting = await Settings.findOne({ownerId})
        if(!setting){
            return NextResponse.json(
                {message: "chat bot is not configured yet."},
                {status:400, headers: corsHeaders }
            )
        }

        const KNOWLEDGE=`
        business name- ${setting.businessName || "not provided"}
        support email- ${setting.supportEmail || "not provided"}
        knowledge- ${setting.knowledge || "not provided"}`


    const propmt=`
    You are the AI customer support assistant for ${setting.businessName}.
Your tone should be friendly, professional, and helpful.

Your job is to help customers using the business information provided below.

Rules:
1. Use the business information as the primary source for answers.
2. You may rephrase or summarize the information if needed.
3. Never invent policies, prices, guarantees, or business details.
4. If the user greets you (hi, hello, hey, good morning, etc.), greet them and welcome them to the business.
5. If the answer is partially available, provide the best helpful response based on the knowledge.
6. If the question cannot be answered from the information, politely say:
"Please contact support."

--------------------
BUSINESS INFORMATION
--------------------
${KNOWLEDGE}

--------------------
CUSTOMER QUESTION
--------------------
${message}

--------------------
ANSWER
--------------------
    `;

 // The client gets the API key from the environment variable `GEMINI_API_KEY`.


    const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
    const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: propmt,
    });
    const reply = res.text || "No response generated";
const response = NextResponse.json({ reply },{ headers: corsHeaders });
      return response
        } catch (error) {
        const response = NextResponse.json(
                {message: `chat error ${error}`},
                {status:500, headers: corsHeaders }
            )
        return response
    }
}

export const OPTIONS = async()=>{
    return NextResponse.json(null, {
        status:200,
        headers: corsHeaders
    });
}