const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({});

function fileToGenerativePart(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function generateLegalResponse(prompt, fileDetails = []) {
  const fileParts = fileDetails.map(file => 
    fileToGenerativePart(file.path, file.mimeType)
  );

  const userMessage = {
    role: "user",
    parts: [
      ...fileParts,
      { text: prompt },
    ],
  };

  const contents = [userMessage];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: contents,
      config: {
        temperature: 0.7,
        systemInstruction: `You are Legal Lens AI, an expert in legal matters. Provide clear, concise, and accurate legal analysis based on the user's prompt and any provided documents (PDF, DOC, images). Always maintain a formal and helpful tone.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from AI service.");
  }
}

module.exports = { generateLegalResponse };