const Replicate = require('replicate');
require('dotenv').config();

// Replicate instance will be created inside the handler to ensure env is ready

const aiController = {
  modifyImage: async (req, res) => {
    try {
      const { image, mask, prompt } = req.body;

      const token = process.env.REPLICATE_API_TOKEN;
      if (!token) {
        console.error('REPLICATE_API_TOKEN is missing from environment variables');
        return res.status(500).json({ message: 'Server configuration error: API Token missing' });
      }

      const replicate = new Replicate({
        auth: token,
      });

      if (!image || !mask || !prompt) {
        return res.status(400).json({ message: 'Missing image, mask, or prompt' });
      }

      console.log('Processing AI modification request...', { prompt });

      const output = await replicate.run(
        "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc67728553ebfae96668117c6ccf873687395c94ba",
        {
          input: {
            image: image,
            mask: mask,
            prompt: prompt,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
          }
        }
      );

      console.log('AI generation complete:', output);
      res.json({ resultUrl: output[0] });

    } catch (error) {
      console.error('AI Processing Error:', error);
      res.status(500).json({
        message: 'Failed to process image',
        error: error.message
      });
    }
  }
};

module.exports = aiController;
