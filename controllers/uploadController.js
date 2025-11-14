const fs = require('fs');
const path = require('path');

const ensureUploadsDir = () => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    return uploadDir;
};

const uploadController = {
    uploadBase64Image: async (req, res) => {
        try {
            const { dataUrl } = req.body;
            if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
                return res.status(400).json({ message: 'Invalid dataUrl' });
            }

            // Parse data URL
            const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
            if (!match) {
                return res.status(400).json({ message: 'Malformed dataUrl' });
            }
            const mimeType = match[1];
            const base64Data = match[2];

            const extension = mimeType.split('/')[1] || 'png';
            const fileName = `thumb_${Date.now()}.${extension}`;
            const uploadDir = ensureUploadsDir();
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

            // Build public URL
            const publicUrl = `/uploads/${fileName}`;
            res.status(201).json({
                message: 'Image uploaded successfully',
                url: publicUrl
            });
        } catch (error) {
            console.error('Upload image error:', error);
            res.status(500).json({ message: 'Server error during image upload' });
        }
    }
};

module.exports = uploadController;

