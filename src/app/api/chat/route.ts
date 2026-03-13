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
                // {status:400}
                {status:400, headers: corsHeaders }
            )
        }
        await connectDb()
        const setting = await Settings.findOne({ownerId})
        if(!setting){
            return NextResponse.json(
                {message: "chat bot is not configured yet."},
                // {status:400}
                {status:400, headers: corsHeaders }
            )
        }

        const KNOWLEDGE=`
        business name- ${setting.businessName || "not provided"}
        support email- ${setting.supportEmail || "not provided"}
        knowledge- ${setting.knowledge || "not provided"}`

        // const propmt=`
        // You are a professional customer support assistant for this business.
        
        // Use ONLY the information provided below to answer the customer's question.
        // you may rephrase, summarize, or interpret the information if needed.
        // Do NOT invent new policies, prices, or promises.
        
        // If the customer's question is completely unrelated to the information,
        // or cannot be reasonably answered from it, reply exactly with:
        // "Please contact support."

        // --------------------
        // BUSINESS INFORMATION
        // --------------------
        // ${KNOWLEDGE}

        // --------------------
        // CUSTOMER QUESTION
        // --------------------
        // ${message}

        // --------------------
        // ANSWER
        // --------------------
        // `;
//         const propmt=`
//         You are a professional customer support assistant for this business.

// Use ONLY the information provided below to answer the customer's question.
// You may rephrase or summarize the information if needed.
// Do NOT invent new policies, prices, or promises.

// If the user greets you (hi, hello, hey, good morning, etc.), respond with
// a polite greeting and welcome them to the business.

// If the customer's question is completely unrelated to the information,
// or cannot be reasonably answered from it, reply exactly with:
// "Please contact support."

// --------------------
// BUSINESS INFORMATION
// --------------------
// ${KNOWLEDGE}

// --------------------
// CUSTOMER QUESTION
// --------------------
// ${message}

// --------------------
// ANSWER
// --------------------`;

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
    // console.log("AI RESPONSE:", res)
    const reply = res.text || "No response generated";
    //   const response = NextResponse.json(res.text)
const response = NextResponse.json({ reply },{ headers: corsHeaders });

        // response.headers.set("Access-Control_Allow-Origin", "*");
        // response.headers.set("Access-Control_Allow-Methods", "POST, OPTIONS" );
        // response.headers.set("Access-Control_Allow-Headers", "Content-Type");
      return response
        } catch (error) {
        const response = NextResponse.json(
                {message: `chat error ${error}`},
                // {status:500}
                {status:500, headers: corsHeaders }
            )
//            response.headers.set("Access-Control-Allow-Origin", "*");
// response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
// response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response
    }
}

export const OPTIONS = async()=>{
    return NextResponse.json(null, {
        status:200,
        headers: corsHeaders
        // headers:{
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Methods": "POST, OPTIONS",
        //     "Access-Control-Allow-Headers": "Content-Type",

        // }
    });
}