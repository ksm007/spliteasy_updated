// app/api/receipt/process/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { image, mimeType } = await request.json();
    
    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Missing image data or MIME type" },
        { status: 400 }
      );
    }

    // Check if API key exists
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key is not configured" },
        { status: 500 }
      );
    }

    // Initialize Google Generative AI with API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt for receipt analysis
    const prompt = `
      You are a highly accurate receipt parser. Given the image of a retail or restaurant receipt,
      extract every line-item and the subtotal, tax, tip, and total. Return ONLY valid JSON with this schema:
      
      {
        "items": [
          { "description": string, "quantity": number, "price": number }
        ],
        "subtotal": number,
        "tax": number,
        "tip": number,
        "total": number
      }
      
      For line items, extract the item description, quantity (default to 1 if not specified), and price.
      If the receipt is unclear or you cannot identify certain values:
      - For missing line items, provide an empty array
      - For missing subtotal, tax, or tip, use 0
      - For missing total, calculate from available values or use 0
    `;

    // Process image with Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          data: image,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();
    
    // Clean the text by removing markdown code blocks if present
    const cleanedText = text.replace(/```(?:json)?\n?|\n```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
      
      // Ensure all fields exist
      const validatedData = {
        items: Array.isArray(parsed.items) ? parsed.items.map(item => ({
          description: String(item.description || "Unknown item"),
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0)
        })) : [],
        subtotal: Number(parsed.subtotal || 0),
        tax: Number(parsed.tax || 0),
        tip: Number(parsed.tip || 0),
        total: Number(parsed.total || 0)
      };
      
      return NextResponse.json(validatedData);
    } catch (parseError) {
      console.error("Failed to parse JSON from Gemini:", cleanedText);
      return NextResponse.json(
        { error: "Invalid JSON from model", details: cleanedText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Receipt processing error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt", details: (error as Error).message },
      { status: 500 }
    );
  }
}