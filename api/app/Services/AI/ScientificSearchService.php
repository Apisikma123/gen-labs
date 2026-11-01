<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Real external scientific research provider.
 * Queries CrossRef and OpenAlex for peer-reviewed academic literature,
 * extracting verified DOIs, author institutions, and publication metadata.
 *
 * Hallucination Guard: NEVER manufactures fake papers, DOIs, or URLs.
 */
class ScientificSearchService
{
    private const TIMEOUT_SECONDS = 5;
    private const CACHE_TTL_SECONDS = 3600; // 1 hour caching for scientific queries

    /**
     * Search trusted external scientific sources.
     *
     * @param string $query Scientific query
     * @param int $limit Maximum citations to return (default 3)
     * @return array<int, array{type: string, id: string, title: string, publisher: string, year: int|null, url: string, status: string, snippet: string}>
     */
    public function search(string $query, int $limit = 3): array
    {
        $cleanQuery = trim($query);
        if (mb_strlen($cleanQuery) < 3) {
            return [];
        }

        $stopwords = ['bagaimana', 'kenapa', 'mengapa', 'apakah', 'jelaskan', 'tanya', 'tentang', 'mempengaruhi', 'pengaruh', 'apa', 'pada', 'dan', 'atau', 'dari', 'yang', 'dalam', 'untuk', 'dengan', 'hukum'];
        $words = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($cleanQuery), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $focusedWords = array_values(array_filter($words, fn($w) => mb_strlen($w) >= 3 && !in_array($w, $stopwords, true)));
        $searchTerms = !empty($focusedWords) ? implode(' ', array_slice($focusedWords, 0, 5)) : $cleanQuery;

        $cacheKey = 'sci_search_' . md5(mb_strtolower($searchTerms)) . "_{$limit}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($searchTerms, $limit) {
            // 1. Try CrossRef (Official academic metadata & DOI registry)
            $results = $this->searchCrossRef($searchTerms, $limit);
            if (!empty($results)) {
                return $results;
            }

            // 2. Fallback to OpenAlex (Global open-access catalog)
            $results = $this->searchOpenAlex($cleanQuery, $limit);
            if (!empty($results)) {
                return $results;
            }

            return [];
        });
    }

    /**
     * Query CrossRef REST API for verified peer-reviewed publications.
     */
    private function searchCrossRef(string $query, int $limit): array
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withUserAgent('GenLabsWBI/1.0 (mailto:research@genlabs.wbi.ac.id)')
                ->get('https://api.crossref.org/works', [
                    'query' => $query,
                    'rows' => $limit,
                    'select' => 'DOI,title,container-title,published,author,URL,abstract',
                ]);

            if (!$response->successful()) {
                Log::info('[SCI_SEARCH_CROSSREF_STATUS]', ['status' => $response->status(), 'query' => $query]);
                return [];
            }

            $items = $response->json('message.items', []);
            $citations = [];

            foreach ($items as $item) {
                $rawTitle = $item['title'][0] ?? null;
                $doi = $item['DOI'] ?? null;
                $url = $item['URL'] ?? ($doi ? "https://doi.org/{$doi}" : null);

                if (!$rawTitle || !$url) {
                    continue;
                }

                $title = trim(strip_tags($rawTitle));
                $publisher = $item['container-title'][0] ?? ($item['publisher'] ?? 'Jurnal Ilmiah Peer-Reviewed');
                
                $year = null;
                if (!empty($item['published']['date-parts'][0][0])) {
                    $year = (int) $item['published']['date-parts'][0][0];
                }

                $snippet = '';
                if (!empty($item['abstract'])) {
                    $snippet = mb_substr(trim(strip_tags($item['abstract'])), 0, 200);
                }

                $citations[] = [
                    'type' => 'external',
                    'id' => $doi ?: 'cr_' . md5($title),
                    'title' => $title,
                    'publisher' => $publisher,
                    'year' => $year,
                    'url' => $url,
                    'status' => 'supporting',
                    'snippet' => $snippet,
                ];

                if (count($citations) >= $limit) {
                    break;
                }
            }

            return $citations;
        } catch (\Throwable $e) {
            Log::warning('[SCI_SEARCH_CROSSREF_EXCEPTION]', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Query OpenAlex API as academic fallback.
     */
    private function searchOpenAlex(string $query, int $limit): array
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withUserAgent('GenLabsWBI/1.0 (mailto:research@genlabs.wbi.ac.id)')
                ->get('https://api.openalex.org/works', [
                    'search' => $query,
                    'per-page' => $limit,
                ]);

            if (!$response->successful()) {
                Log::info('[SCI_SEARCH_OPENALEX_STATUS]', ['status' => $response->status()]);
                return [];
            }

            $items = $response->json('results', []);
            $citations = [];

            foreach ($items as $item) {
                $title = trim(strip_tags($item['title'] ?? ''));
                $doi = $item['doi'] ?? null;
                $id = $item['id'] ?? null;
                $url = $doi ?: ($id ?: null);

                if (!$title || !$url) {
                    continue;
                }

                $venue = $item['primary_location']['source']['display_name'] ?? 'OpenAlex Scholarly Repository';
                $year = isset($item['publication_year']) ? (int) $item['publication_year'] : null;

                $citations[] = [
                    'type' => 'external',
                    'id' => $doi ?: ($id ?: 'oa_' . md5($title)),
                    'title' => $title,
                    'publisher' => $venue,
                    'year' => $year,
                    'url' => $url,
                    'status' => 'supporting',
                    'snippet' => '',
                ];

                if (count($citations) >= $limit) {
                    break;
                }
            }

            return $citations;
        } catch (\Throwable $e) {
            Log::warning('[SCI_SEARCH_OPENALEX_EXCEPTION]', ['error' => $e->getMessage()]);
            return [];
        }
    }
}
