import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { authenticateAdmin } from '@/lib/auth/server-guard';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB strict limit

type SafeImageType = 'jpg' | 'png' | 'webp';

/**
 * Validate actual binary file content / signature (magic bytes)
 * Rejects SVG, HTML, executables, scripts, etc.
 */
function validateImageMagicBytes(buffer: Buffer): SafeImageType | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return 'png';
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

export async function POST(request: Request) {
  try {
    // 1. Enforce verified Administrator authorization server-side
    const auth = await authenticateAdmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle JSON payload: AI thumbnail preview (returns safe Data URI, never writes raw SVG to public disk)
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      const title = String(body?.title || 'Simulasi GEN LABS').replace(/[<>]/g, '');
      const discipline = String(body?.discipline || 'Fisika').replace(/[<>]/g, '');

      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><rect width="640" height="360" fill="#0c130e"/><circle cx="520" cy="180" r="140" fill="none" stroke="#25E289" stroke-width="1.5" stroke-opacity="0.2"/><text x="48" y="160" fill="#25E289" font-family="monospace" font-size="12" font-weight="bold">${discipline.toUpperCase()}</text><text x="48" y="210" fill="#E6ECE8" font-family="sans-serif" font-size="28" font-weight="bold">${title}</text></svg>`;
      const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgData).toString('base64')}`;

      return NextResponse.json({
        success: true,
        media: {
          url: dataUri,
          width: 640,
          height: 360,
          type: 'thumbnail',
          is_ai: true,
        },
        message: 'Thumbnail visualisasi AI siap digunakan.',
      });
    }

    // 2. Handle Multipart Form-Data Upload
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const rawType = (formData.get('type') as string) || 'thumbnail';
    // Sanitize type parameter to prevent any path injection
    const safeType = rawType === 'cover' ? 'cover' : 'thumbnail';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File gambar diperlukan.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Size validation
    if (buffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'File tidak boleh kosong.' },
        { status: 400 }
      );
    }

    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file melebihi batas 5MB.' },
        { status: 400 }
      );
    }

    // 4. Magic Byte / File Content validation (JPEG, PNG, WebP ONLY)
    const detectedFormat = validateImageMagicBytes(buffer);
    if (!detectedFormat) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format file tidak didukung atau berbahaya. Hanya gambar JPEG, PNG, dan WebP yang diizinkan.',
        },
        { status: 400 }
      );
    }

    // 5. Generate server-controlled random filename (never trust client filename)
    const safeExt = detectedFormat === 'jpg' ? '.jpg' : detectedFormat === 'png' ? '.png' : '.webp';
    const serverFilename = `${safeType}_${crypto.randomUUID()}${safeExt}`;

    const uploadDir = path.resolve(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const destPath = path.join(uploadDir, serverFilename);
    // Path traversal defense assertion
    if (!destPath.startsWith(uploadDir)) {
      return NextResponse.json(
        { success: false, error: 'Akses path tidak valid.' },
        { status: 400 }
      );
    }

    // Write verified safe image
    fs.writeFileSync(destPath, buffer);

    const sizeKb = Math.round((buffer.byteLength / 1024) * 10) / 10;
    const width = safeType === 'cover' ? 1280 : 640;
    const height = safeType === 'cover' ? 720 : 360;

    return NextResponse.json({
      success: true,
      media: {
        url: `/uploads/${serverFilename}`,
        filename: serverFilename,
        format: detectedFormat,
        width,
        height,
        type: safeType,
        size_kb: sizeKb,
      },
      message: 'Gambar berhasil diverifikasi dan diunggah.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengunggah media.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
