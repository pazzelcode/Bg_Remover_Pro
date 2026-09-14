import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'BgRemove Pro Fast AI',
    provider: 'Photoroom',
    configured: Boolean(process.env.PHOTOROOM_API_KEY),
  });
});

app.post(
  '/api/remove-background',
  upload.single('image'),
  async (req, res) => {
    try {
      if (!process.env.PHOTOROOM_API_KEY) {
        return res.status(500).json({
          error: 'PHOTOROOM_API_KEY belum dikonfigurasi.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Gambar tidak ditemukan.',
        });
      }

      const formData = new FormData();

      const imageBlob = new Blob(
        [req.file.buffer],
        {
          type: req.file.mimetype,
        }
      );

      formData.append(
        'imageFile',
        imageBlob,
        req.file.originalname
      );

      formData.append(
        'removeBackground',
        'true'
      );

      console.log(
        `⚡ Fast AI: ${req.file.originalname} (${Math.round(req.file.size / 1024)} KB)`
      );

      const response = await fetch(
        'https://image-api.photoroom.com/v2/edit',
        {
          method: 'POST',
          headers: {
            'x-api-key':
              process.env.PHOTOROOM_API_KEY,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          'Photoroom error:',
          response.status,
          errorText
        );

        return res.status(response.status).json({
          error:
            'Photoroom gagal memproses gambar.',
          details: errorText,
        });
      }

      const resultBuffer =
        Buffer.from(
          await response.arrayBuffer()
        );

      res.setHeader(
        'Content-Type',
        response.headers.get(
          'content-type'
        ) || 'image/png'
      );

      res.setHeader(
        'Content-Length',
        resultBuffer.length
      );

      res.setHeader(
        'Cache-Control',
        'no-store'
      );

      return res.send(resultBuffer);

    } catch (error) {
      console.error(
        'Fast AI error:',
        error
      );

      return res.status(500).json({
        error:
          'Terjadi kesalahan pada Fast AI.',
      });
    }
  }
);

app.listen(PORT, () => {
  console.log('');
  console.log(
    '🚀 BgRemove Pro Fast AI'
  );
  console.log(
    `📡 http://localhost:${PORT}`
  );
  console.log(
    `🔑 API Key: ${
      process.env.PHOTOROOM_API_KEY
        ? 'CONFIGURED'
        : 'NOT CONFIGURED'
    }`
  );
  console.log('');
});
