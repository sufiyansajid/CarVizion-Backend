const path = require('path');
const fs = require('fs');
const https = require('https');
const { URL } = require('url');

function ensureDir(dirPath) {
    const abs = path.join(__dirname, '..', dirPath);
    if (!fs.existsSync(abs)) {
        fs.mkdirSync(abs, { recursive: true });
    }
    return abs;
}

function dataUrlToBuffer(dataUrl) {
    const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
    if (!match) return null;
    const mimeType = match[1];
    const base64 = match[2];
    return { buffer: Buffer.from(base64, 'base64'), mimeType };
}

async function postBinaryToHuggingFace({ url, token, buffer, contentType }) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const options = {
            hostname: u.hostname,
            path: u.pathname + (u.search || ''),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': contentType,
                'Accept': '*/*',
                'Content-Length': buffer.length
            }
        };
        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', (d) => chunks.push(d));
            res.on('end', () => {
                const body = Buffer.concat(chunks);
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body
                    });
                } else {
                    resolve({
                        status: res.statusCode || 500,
                        headers: res.headers,
                        body
                    });
                }
            });
        });
        req.on('error', reject);
        req.write(buffer);
        req.end();
    });
}

const aiController = {
    imageTo3D: async (req, res) => {
        try {
            const hfToken = process.env.HF_TOKEN;
            const hfUrl = process.env.HF_IMAGE_TO_3D_URL || 'https://api-inference.huggingface.co/models/stabilityai/TripoSR';
            if (!hfToken) {
                return res.status(500).json({ message: 'HF_TOKEN is not configured on the server' });
            }
            const { dataUrl } = req.body;
            if (!dataUrl || typeof dataUrl !== 'string') {
                return res.status(400).json({ message: 'dataUrl is required' });
            }
            const parsed = dataUrlToBuffer(dataUrl);
            if (!parsed) {
                return res.status(400).json({ message: 'Invalid dataUrl format' });
            }

            const { buffer, mimeType } = parsed;
            const hfResponse = await postBinaryToHuggingFace({
                url: hfUrl,
                token: hfToken,
                buffer,
                contentType: mimeType
            });

            // If HF returns JSON error, surface it
            const contentType = (hfResponse.headers['content-type'] || '').toString();
            if (hfResponse.status >= 400) {
                const text = hfResponse.body.toString('utf-8');

                if (hfResponse.status === 410) {
                    return res.status(410).json({
                        message: 'Hugging Face reported 410 (Gone). The model endpoint may be gated or unavailable. Ensure your HF token has access or configure HF_IMAGE_TO_3D_URL to a valid Inference Endpoint.',
                        details: text.slice(0, 1000)
                    });
                }

                try {
                    const json = JSON.parse(text);
                    return res.status(hfResponse.status).json({
                        message: json?.error || 'Failed to generate model from Hugging Face',
                        details: json
                    });
                } catch (parseErr) {
                    return res.status(hfResponse.status).json({
                        message: 'Failed to generate model from Hugging Face',
                        details: text.slice(0, 1000)
                    });
                }
            }

            // Determine file extension from content-type
            let ext = 'zip';
            if (contentType.includes('model/gltf-binary') || contentType.includes('application/octet-stream')) {
                ext = 'glb';
            } else if (contentType.includes('application/zip')) {
                ext = 'zip';
            }

            const modelsDir = ensureDir('uploads/models');
            const fileName = `model_${Date.now()}.${ext}`;
            const filePath = path.join(modelsDir, fileName);
            fs.writeFileSync(filePath, hfResponse.body);

            return res.status(201).json({
                message: '3D model generated successfully',
                model_url: `/uploads/models/${fileName}`,
                content_type: contentType
            });
        } catch (error) {
            console.error('imageTo3D error:', error);
            return res.status(500).json({ message: 'Server error while generating 3D model' });
        }
    }
};

module.exports = aiController;

