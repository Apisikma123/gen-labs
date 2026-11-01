<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Thin server-side Gemini REST client. Throws on any failure; callers must
 * never substitute a fabricated answer.
 */
class GeminiClient
{
    public function isConfigured(): bool
    {
        return !empty(config('ai.api_key'));
    }

    public function generate(
        string $model,
        string $systemInstruction,
        string $userText,
        int $maxOutputTokens = 700,
        float $temperature = 0.3,
        array $history = [],
        ?string $requestId = null
    ): string {
        if (!$this->isConfigured()) {
            throw new RuntimeException('Gemini API key not configured.');
        }

        $apiKey = config('ai.api_key');
        $modelsToTry = array_values(array_unique([
            $model,
            config('ai.model', 'gemini-3.5-flash-lite'),
            'gemini-3.5-flash-lite',
            'gemini-3.5-flash',
            'gemini-flash-latest',
        ]));

        // Build clean multi-turn contents with alternating user / model roles
        $contents = [];
        $trimmedHistory = array_slice($history, -8);
        foreach ($trimmedHistory as $msg) {
            $role = ($msg['role'] ?? '') === 'assistant' ? 'model' : 'user';
            $text = trim((string)($msg['content'] ?? ''));
            if ($text !== '') {
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => $text]],
                ];
            }
        }
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userText]],
        ];

        $normalizedContents = [];
        $lastRole = null;
        foreach ($contents as $c) {
            if ($c['role'] === $lastRole) {
                $lastIdx = count($normalizedContents) - 1;
                $normalizedContents[$lastIdx]['parts'][0]['text'] .= "\n\n" . $c['parts'][0]['text'];
            } else {
                $normalizedContents[] = $c;
                $lastRole = $c['role'];
            }
        }
        if (!empty($normalizedContents) && $normalizedContents[0]['role'] === 'model') {
            array_shift($normalizedContents);
        }
        if (empty($normalizedContents)) {
            $normalizedContents = [
                ['role' => 'user', 'parts' => [['text' => $userText]]]
            ];
        }

        $reqId = $requestId ?? uniqid('ai_', true);
        $lastException = null;

        foreach ($modelsToTry as $targetModel) {
            $started = microtime(true);
            try {
                $response = Http::withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout(config('ai.timeout', 30))
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$targetModel}:generateContent", [
                    'systemInstruction' => ['parts' => [['text' => $systemInstruction]]],
                    'contents' => $normalizedContents,
                    'generationConfig' => [
                        'temperature' => $temperature,
                        'maxOutputTokens' => $maxOutputTokens,
                    ],
                ]);

                $usage = $response->json('usageMetadata', []);
                $status = $response->status();
                $latencyMs = (int) ((microtime(true) - $started) * 1000);

                Log::info('[GEN_LABS_AI]', [
                    'request_id' => $reqId,
                    'model' => $targetModel,
                    'status' => $status,
                    'latency_ms' => $latencyMs,
                    'input_tokens' => $usage['promptTokenCount'] ?? null,
                    'output_tokens' => $usage['candidatesTokenCount'] ?? null,
                ]);

                if ($response->successful()) {
                    $parts = $response->json('candidates.0.content.parts', []);
                    $text = trim(implode('', array_map(fn ($p) => $p['text'] ?? '', $parts)));
                    if ($text !== '') {
                        return $text;
                    }
                }

                $errorBody = $response->json('error.message') ?? substr($response->body(), 0, 200);
                $lastException = new RuntimeException("Gemini model {$targetModel} returned status {$status}: {$errorBody}");

                // If 404, 503, 429, or 500, cascade to next candidate model
                if (!in_array($status, [404, 503, 429, 500, 400])) {
                    break;
                }
            } catch (\Throwable $e) {
                $lastException = $e;
                Log::warning('[GEN_LABS_AI_ATTEMPT_FAILED]', [
                    'request_id' => $reqId,
                    'model' => $targetModel,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        throw $lastException ?? new RuntimeException('Gemini request failed.');
    }
}
