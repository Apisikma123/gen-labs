<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ImageOptimizationService
{
    protected string $storageDir;
    protected string $publicUrlPrefix = '/uploads/modules/';

    public function __construct()
    {
        $this->storageDir = public_path('uploads/modules');
        if (!file_exists($this->storageDir)) {
            mkdir($this->storageDir, 0755, true);
        }
    }

    /**
     * Optimize, resize, and store an uploaded image into WebP format
     *
     * @param UploadedFile $file
     * @param string $type 'thumbnail' | 'cover'
     * @return array
     */
    public function optimizeAndStore(UploadedFile $file, string $type = 'thumbnail'): array
    {
        $originalSize = $file->getSize();
        $sourcePath = $file->getRealPath();
        $mime = $file->getMimeType();

        // Load image using GD based on mime type
        $srcImage = null;
        switch ($mime) {
            case 'image/jpeg':
            case 'image/jpg':
                $srcImage = @imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $srcImage = @imagecreatefrompng($sourcePath);
                break;
            case 'image/webp':
                $srcImage = @imagecreatefromwebp($sourcePath);
                break;
            case 'image/gif':
                $srcImage = @imagecreatefromgif($sourcePath);
                break;
        }

        if (!$srcImage) {
            throw new \InvalidArgumentException('Format gambar tidak didukung atau file korup. Gunakan JPEG, PNG, atau WebP.');
        }

        $origW = imagesx($srcImage);
        $origH = imagesy($srcImage);

        // Target constraints
        $maxW = $type === 'cover' ? 1280 : 640;
        $maxH = $type === 'cover' ? 720 : 360;

        // Calculate proportional scale
        $ratio = min($maxW / $origW, $maxH / $origH, 1.0);
        $targetW = max(1, (int) round($origW * $ratio));
        $targetH = max(1, (int) round($origH * $ratio));

        $destImage = imagecreatetruecolor($targetW, $targetH);

        // Alpha channel handling
        imagealphablending($destImage, false);
        imagesavealpha($destImage, true);
        $transparent = imagecolorallocatealpha($destImage, 255, 255, 255, 127);
        imagefilledrectangle($destImage, 0, 0, $targetW, $targetH, $transparent);

        imagecopyresampled(
            $destImage,
            $srcImage,
            0, 0, 0, 0,
            $targetW,
            $targetH,
            $origW,
            $origH
        );

        $filename = 'sim_' . Str::random(12) . '_' . $type . '.webp';
        $destPath = $this->storageDir . DIRECTORY_SEPARATOR . $filename;

        // Save as WebP with 82% quality (excellent balance of sharpness and tiny byte footprint)
        $quality = $type === 'cover' ? 84 : 80;
        if (function_exists('imagewebp')) {
            imagewebp($destImage, $destPath, $quality);
        } else {
            // Fallback to high quality JPEG if WebP GD is missing
            $filename = str_replace('.webp', '.jpg', $filename);
            $destPath = $this->storageDir . DIRECTORY_SEPARATOR . $filename;
            imagejpeg($destImage, $destPath, $quality);
        }

        imagedestroy($srcImage);
        imagedestroy($destImage);

        $optimizedSize = file_exists($destPath) ? filesize($destPath) : 0;

        return [
            'url' => $this->publicUrlPrefix . $filename,
            'filename' => $filename,
            'width' => $targetW,
            'height' => $targetH,
            'type' => $type,
            'original_size_kb' => round($originalSize / 1024, 1),
            'optimized_size_kb' => round($optimizedSize / 1024, 1),
            'savings_pct' => $originalSize > 0 ? round((1 - ($optimizedSize / $originalSize)) * 100, 1) : 0,
        ];
    }

    /**
     * Generate a lightweight, professional AI concept thumbnail based on module attributes
     */
    public function generateAiThumbnail(string $title, string $discipline, ?string $topic = null): array
    {
        $w = 640;
        $h = 360;
        $img = imagecreatetruecolor($w, $h);

        // Curated discipline color themes (Gen Labs professional tones)
        $palette = $this->getDisciplineTheme($discipline);

        // Fill background with elegant subtle gradient
        for ($y = 0; $y < $h; $y++) {
            $ratio = $y / $h;
            $r = (int) ($palette['bg_top'][0] * (1 - $ratio) + $palette['bg_bottom'][0] * $ratio);
            $g = (int) ($palette['bg_top'][1] * (1 - $ratio) + $palette['bg_bottom'][1] * $ratio);
            $b = (int) ($palette['bg_top'][2] * (1 - $ratio) + $palette['bg_bottom'][2] * $ratio);
            $color = imagecolorallocate($img, $r, $g, $b);
            imageline($img, 0, $y, $w, $y, $color);
        }

        // Draw modern subtle geometric grid lines
        $gridColor = imagecolorallocatealpha($img, $palette['accent'][0], $palette['accent'][1], $palette['accent'][2], 115);
        for ($x = 0; $x < $w; $x += 32) {
            imageline($img, $x, 0, $x, $h, $gridColor);
        }
        for ($y = 0; $y < $h; $y += 32) {
            imageline($img, 0, $y, $w, $y, $gridColor);
        }

        // Draw dynamic conceptual graphical elements (curved waves or nodes)
        $waveColor = imagecolorallocatealpha($img, $palette['primary'][0], $palette['primary'][1], $palette['primary'][2], 75);
        imagesetthickness($img, 3);
        $prevX = 0;
        $prevY = (int) ($h / 2);
        for ($x = 0; $x <= $w; $x += 10) {
            $curY = (int) ($h / 2 + sin($x / 40) * 45 + cos($x / 60) * 20);
            imageline($img, $prevX, $prevY, $x, $curY, $waveColor);
            $prevX = $x;
            $prevY = $curY;
        }

        // Draw conceptual nodes
        $nodeColor = imagecolorallocatealpha($img, $palette['accent'][0], $palette['accent'][1], $palette['accent'][2], 50);
        for ($i = 0; $i < 6; $i++) {
            $nodeX = (int) (80 + $i * 95);
            $nodeY = (int) ($h / 2 + sin($nodeX / 40) * 45 + cos($nodeX / 60) * 20);
            imagefilledellipse($img, $nodeX, $nodeY, 14, 14, $nodeColor);
        }

        $filename = 'sim_ai_' . Str::random(10) . '_thumb.webp';
        $destPath = $this->storageDir . DIRECTORY_SEPARATOR . $filename;

        if (function_exists('imagewebp')) {
            imagewebp($img, $destPath, 82);
        } else {
            $filename = str_replace('.webp', '.jpg', $filename);
            $destPath = $this->storageDir . DIRECTORY_SEPARATOR . $filename;
            imagejpeg($img, $destPath, 82);
        }

        imagedestroy($img);
        $fileSize = file_exists($destPath) ? filesize($destPath) : 0;

        return [
            'url' => $this->publicUrlPrefix . $filename,
            'filename' => $filename,
            'width' => $w,
            'height' => $h,
            'type' => 'thumbnail',
            'is_ai' => true,
            'optimized_size_kb' => round($fileSize / 1024, 1),
        ];
    }

    /**
     * Delete an existing image from uploads directory
     */
    public function deleteFile(?string $urlOrFilename): bool
    {
        if (!$urlOrFilename || !is_string($urlOrFilename)) {
            return false;
        }

        // Extract strictly the base filename to prevent path traversal
        $filename = basename(parse_url($urlOrFilename, PHP_URL_PATH) ?? $urlOrFilename);
        if (empty($filename) || $filename === '.' || $filename === '..') {
            return false;
        }

        $fullPath = $this->storageDir . DIRECTORY_SEPARATOR . $filename;

        // Ensure realpath stays strictly inside storageDir
        $realStorageDir = realpath($this->storageDir);
        if (!$realStorageDir || !file_exists($fullPath) || !is_file($fullPath)) {
            return false;
        }

        $realFilePath = realpath($fullPath);
        if (!$realFilePath || !str_starts_with($realFilePath, $realStorageDir)) {
            return false;
        }

        return @unlink($realFilePath);
    }

    /**
     * Color themes tailored for Gen Labs disciplines
     */
    protected function getDisciplineTheme(string $discipline): array
    {
        $d = strtolower($discipline);

        if (str_contains($d, 'perangkat lunak') || str_contains($d, 'trpl') || str_contains($d, 'komput') || str_contains($d, 'informatika')) {
            return [
                'bg_top' => [15, 23, 42],       // Slate 900
                'bg_bottom' => [30, 41, 59],    // Slate 800
                'primary' => [16, 185, 129],    // Emerald 500
                'accent' => [56, 189, 248],     // Sky 400
            ];
        }

        if (str_contains($d, 'akuntansi') || str_contains($d, 'pajak') || str_contains($d, 'keuangan')) {
            return [
                'bg_top' => [12, 28, 48],
                'bg_bottom' => [23, 48, 77],
                'primary' => [59, 130, 246],    // Blue 500
                'accent' => [245, 158, 11],     // Amber 500
            ];
        }

        if (str_contains($d, 'pemasaran') || str_contains($d, 'bisnis') || str_contains($d, 'internasional')) {
            return [
                'bg_top' => [20, 36, 30],
                'bg_bottom' => [35, 60, 48],
                'primary' => [16, 185, 129],    // Emerald
                'accent' => [251, 146, 60],     // Coral/Orange
            ];
        }

        if (str_contains($d, 'hortikultura') || str_contains($d, 'agribisnis') || str_contains($d, 'pertanian')) {
            return [
                'bg_top' => [18, 43, 31],
                'bg_bottom' => [28, 64, 46],
                'primary' => [34, 197, 94],     // Green 500
                'accent' => [234, 179, 8],      // Yellow 500
            ];
        }

        if (str_contains($d, 'konvensi') || str_contains($d, 'acara') || str_contains($d, 'event') || str_contains($d, 'mice')) {
            return [
                'bg_top' => [30, 27, 75],       // Indigo 950
                'bg_bottom' => [49, 46, 129],   // Indigo 900
                'primary' => [139, 92, 246],    // Violet 500
                'accent' => [236, 72, 153],     // Pink 500
            ];
        }

        // Default Sains / Matematika
        return [
            'bg_top' => [15, 23, 42],
            'bg_bottom' => [24, 38, 62],
            'primary' => [14, 165, 233],
            'accent' => [99, 102, 241],
        ];
    }
}
