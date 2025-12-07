// const { GoogleGenAI } = require("@google/genai");
// const fs = require('fs');


// const ai = new GoogleGenAI({});

// function fileToGenerativePart(filePath, mimeType) {
//   if (!fs.existsSync(filePath)) {
//     throw new Error(`File not found at path: ${filePath}`);
//   }
//   const fileData = fs.readFileSync(filePath);

//   return {
//     inlineData: {
//       data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
//       mimeType
//     },
//   };
// }

// async function generateLegalResponse(prompt, fileDetails = []) {
//   const fileParts = fileDetails.map(file =>{
//         try {
//             return fileToGenerativePart(file.path, file.mimeType);
//         } catch (e) {
//             // File not found ka error agar aata hai to yahan handle ho jayega
//             console.warn(`Skipping file due to error: ${e.message}`);
//             return null;
//         }
//     }).filter(part => part !== null);
  

//   const userMessage = {
//     role: "user",
//     parts: [
//       ...fileParts,
//       { text: prompt },
//     ],
//   };

//   const contents = [userMessage];

//   try {
//     const response = await  ai.models.generateContent({
//       model: "gemini-2.0-flash", 
//       contents: contents,
//       config: {
//         temperature: 0.7,
//         systemInstruction: `You are Legal Lens AI, an expert in legal matters. Provide clear, concise, and accurate legal analysis based on the user's prompt and any provided documents (PDF, DOC, images). Always maintain a formal and helpful tone.`,
//       },
//     });

//     return  response.text;
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     throw new Error("Failed to get response from AI service.");
//   }
// }

// module.exports = { generateLegalResponse };



// File: src/services/ai.service.js

const OpenAI = require("openai");
const fs = require('fs');

// Initialize OpenAI client
// Ensure OPENAI_API_KEY is set in your environment variables (.env file)
const openai = new OpenAI({}); 

/**
 * Converts a local file path and MIME type into an OpenAI-compatible content part.
 * Note: OpenAI's multi-modal (Vision) models primarily support images in the message array.
 * PDF/DOC files require conversion or upload to a server/storage service first.
 * For simplicity and direct replacement, we will treat all files as images (base64).
 */
function fileToOpenAIContentPart(filePath, mimeType) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
    }
    
    // Read file data and convert to Base64
    const base64Data = fs.readFileSync(filePath).toString("base64");

    // OpenAI Vision model expects this structure for image/file analysis:
    return {
        type: "image_url",
        image_url: {
            // Data URL format: data:<mimeType>;base64,<base64Data>
            url: `data:${mimeType};base64,${base64Data}`,
        },
    };
}

/**
 * Generates a legal analysis response using OpenAI's models (like GPT-4 Vision).
 * @param {string} prompt - The text prompt from the user.
 * @param {Array<{path: string, mimeType: string}>} fileDetails - Array of local file paths and MIME types.
 * @returns {Promise<string>} The AI's generated text response.
 */
async function generateLegalResponse(prompt, fileDetails = []) {
    
    // 1. Content Array (Files aur Text ko combine karna)
    let contentParts = [];

    // Files ko contentParts mein add karna
    fileDetails.forEach(file => {
        try {
            const part = fileToOpenAIContentPart(file.path, file.mimeType);
            contentParts.push(part);
        } catch (e) {
            console.warn(`Skipping file due to error: ${e.message}`);
        }
    });

    // Prompt (Text) ko contentParts mein add karna
    contentParts.push({ 
        type: "text", 
        text: prompt 
    });

    try {
        const response = await openai.chat.completions.create({
            
            // ⭐ Model Selection: 'gpt-4-turbo' ya 'gpt-4o' Vision capabilities ke liye zaroori hain
            model: "gpt-4o", // Ya 'gpt-4-turbo' use karen jo multi-modal support karta hai
            
            // System instruction ko messages array ke pehle element mein dena hota hai
            messages: [
                {
                    role: "system",
                    content: `You are Legal Lens AI, an expert in legal matters. Provide clear, concise, and accurate legal analysis based on the user's prompt and any provided documents (PDF, images). Always maintain a formal and helpful tone.`,
                },
                {
                    role: "user",
                    content: contentParts, // Files aur Text ka combined array
                },
            ],
            temperature: 0.7,
        });

        // 2. Response se text extract karna
        return response.choices[0].message.content;
        
    } catch (error) {
        console.error("OpenAI API Error:", error.message);
        throw new Error("Failed to get response from AI service.");
    }
}

module.exports = { generateLegalResponse };