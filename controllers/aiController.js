require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const aiController = {
  // Gemini-powered image modification
  modifyImage: async (req, res) => {
    try {
      const { image, mask, prompt } = req.body;

      // Check for Gemini API key
      const geminiKey = process.env.GEMINI_API_KEY;

      if (!geminiKey) {
        return res.status(500).json({
          message: 'GEMINI_API_KEY is missing. Add it to your .env file.',
          setup: 'Get a free key at https://aistudio.google.com/app/apikey'
        });
      }

      if (!image) {
        return res.status(400).json({ message: 'Missing image data' });
      }
      if (!mask) {
        return res.status(400).json({ message: 'Missing mask - please select an area first' });
      }
      if (!prompt) {
        return res.status(400).json({ message: 'Missing prompt - please select a customization option' });
      }

      console.log('Processing with Gemini...');
      console.log('  Prompt:', prompt);

      const genAI = new GoogleGenerativeAI(geminiKey);

      // Use Gemini 2.0 Flash with image generation capability
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseModalities: ["image", "text"],
        }
      });

      // Extract base64 from data URL
      const imageBase64 = image.split(',')[1];
      const maskBase64 = mask.split(',')[1];

      // Create the prompt with image context
      const enhancedPrompt = `You are an expert automotive image editor. 
I have a car image and a selection mask (white areas show where to modify).
Please modify ONLY the white/selected areas of the car image according to this request: "${prompt}"
Keep everything else exactly the same. The result should look natural and photorealistic.
Return only the modified car image.`;

      const result = await model.generateContent([
        enhancedPrompt,
        {
          inlineData: {
            mimeType: "image/png",
            data: imageBase64
          }
        },
        {
          inlineData: {
            mimeType: "image/png",
            data: maskBase64
          }
        }
      ]);

      const response = await result.response;

      // Check for image in response
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const resultBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            console.log('Gemini generation complete!');
            return res.json({ resultUrl: resultBase64 });
          }
        }
      }

      // If no image generated, return text response
      const textResponse = response.text();
      console.log('Gemini text response:', textResponse);

      return res.status(500).json({
        message: 'Gemini did not generate an image. Try a different prompt.',
        details: textResponse
      });

    } catch (error) {
      console.error('Gemini Processing Error:', error);

      let errorMessage = 'Failed to process image';
      if (error.message?.includes('API key')) {
        errorMessage = 'Invalid Gemini API key';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'API quota exceeded - try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({
        message: errorMessage,
        error: error.message
      });
    }
  },

  // SAM segmentation (disabled - using local magic wand instead)
  segmentImage: async (req, res) => {
    res.status(501).json({ message: 'Use the Magic Wand tool for selection' });
  }
};

module.exports = aiController;
