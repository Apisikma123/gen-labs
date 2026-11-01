<?php

namespace App\Http\Controllers;

use App\Services\Media\ImageOptimizationService;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    protected ImageOptimizationService $imageService;

    public function __construct(ImageOptimizationService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Upload and optimize an image (Cover or Thumbnail)
     * POST /api/admin/media/upload
     */
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,jpg,png,webp,gif|max:8192', // Max 8MB input
            'type' => 'nullable|string|in:thumbnail,cover',
        ]);

        $type = $request->input('type', 'thumbnail');
        $file = $request->file('image');

        try {
            $result = $this->imageService->optimizeAndStore($file, $type);

            return response()->json([
                'success' => true,
                'media' => $result,
                'message' => 'Gambar berhasil diunggah dan dioptimalkan secara otomatis.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses gambar: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Generate an AI concept thumbnail for a module
     * POST /api/admin/media/generate-ai-thumbnail
     */
    public function generateAiThumbnail(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'discipline' => 'required|string|max:100',
            'topic' => 'nullable|string|max:150',
        ]);

        try {
            $result = $this->imageService->generateAiThumbnail(
                $request->input('title'),
                $request->input('discipline'),
                $request->input('topic')
            );

            return response()->json([
                'success' => true,
                'media' => $result,
                'message' => 'Thumbnail AI berhasil dibuat. Anda dapat menggantinya kapan saja.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat thumbnail AI: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an uploaded image
     * DELETE /api/admin/media
     */
    public function delete(Request $request)
    {
        $url = $request->input('url');
        if (!$url || !is_string($url)) {
            return response()->json(['success' => false, 'message' => 'URL gambar tidak valid.'], 400);
        }

        // Security check: restrict deletion to the dedicated module upload folder and strip directory traversal
        $sanitizedFilename = basename(parse_url($url, PHP_URL_PATH) ?? $url);
        if (empty($sanitizedFilename) || str_contains($url, '..')) {
            return response()->json(['success' => false, 'message' => 'Nama file tidak valid.'], 422);
        }

        $deleted = $this->imageService->deleteFile($sanitizedFilename);

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'message' => $deleted ? 'Gambar berhasil dihapus.' : 'File tidak ditemukan atau telah dihapus sebelumnya.',
        ]);
    }
}
