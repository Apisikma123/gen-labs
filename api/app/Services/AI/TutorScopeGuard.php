<?php

namespace App\Services\AI;

/**
 * Local, zero-token scope guard for the student AI Tutor.
 *
 * Verdicts:
 *  - out:       clearly unrelated / injection -> refuse (State D)
 *  - in:        in-scope for GENLABS WBI lab or scientific concept
 *  - ambiguous: generic wording requiring clarification
 */
class TutorScopeGuard
{
    private const BLOCK_PATTERNS = [
        // prompt injection / secrets / internals
        '/(abaikan|lupakan|ignore|disregard)\s+(semua\s+|all\s+|the\s+)?(instruksi|perintah|instructions?|aturan|rules|previous)/i',
        '/(system\s*prompt|prompt\s+sistem|developer\s+(prompt|instruction)|instruksi\s+(internal|sistem|tersembunyi)|hidden\s+(context|prompt))/i',
        '/(api[_\s-]?key|secret|kredensial|credential|password|kata\s+sandi|token\s+akses|\.env|environment\s+variable)/i',
        '/(exploit|injection|sql\s*injection|bypass(\s+admin)?\s+login|hacking|hacker|malware|ransomware|trojan|backdoor|phishing|reverse\s*shell)/i',
        '/(jadilah|berperan\s+sebagai|act\s+as|pretend|kamu\s+sekarang\s+adalah)\s+/i',
        '/(chatgpt|jailbreak|mode\s+bebas|dan\s+mode)/i',
        '/(source\s*code|kode\s+sumber|backend|database|basis\s+data|struktur\s+tabel|arsitektur\s+(sistem|internal)|server\s+anda)/i',
        // jokes / chit-chat
        '/\b(jokes?|lelucon|lawakan|lucu|tebak[\s-]?tebakan|gombal|curhat)\b/i',
        // food / recipes
        '/\b(resep|masak|memasak|recipe)\b/i',
        '/\b(es\s+cendol|cendol|nasi\s+goreng|rendang|bakso|sate|martabak|kue|seblak|mie\s+ayam)\b/i',
        // politics / public figures / election / celebrity
        '/\b(presiden|wakil\s+presiden|menteri|gubernur|bupati|partai|pemilu|politik|raja|ratu)\b/i',
        '/\b(sepak\s*bola|messi|ronaldo|piala\s+dunia|liga|film|drakor|anime|artis|selebriti|lagu)\b/i',
        '/\b(zodiak|horoskop|ramalan|primbon)\b/i',
        // creative fiction / poetry
        '/\b(buatkan|tuliskan|karang|bikinkan|write)\b.*\b(puisi|pantun|cerpen|cerita|lirik|esai|essay|poem|story|surat)\b/i',
        '/\b(puisi|pantun|cerpen)\b/i',
        // consumer electronics shopping
        '/\b(harga|beli|jual|promo|diskon)\s+(laptop|hp|handphone|smartphone|komputer|motor|mobil|iphone|samsung)\b/i',
        '/\b(berapa\s+harga)\s+(laptop|hp|handphone|smartphone|komputer|motor|mobil)\b/i',
        '/\b(cuaca|berita\s+terkini|gosip)\b/i',
    ];

    // Generic words to ignore in token analysis
    private const STOPWORDS = [
        'yang', 'dan', 'atau', 'dari', 'untuk', 'dengan', 'pada', 'dalam', 'ini', 'itu', 'apa', 'apakah',
        'bagaimana', 'kenapa', 'mengapa', 'saya', 'aku', 'kamu', 'anda', 'adalah', 'jika', 'kalau', 'bisa',
        'tidak', 'akan', 'juga', 'sudah', 'belum', 'ada', 'lebih', 'sangat', 'jelaskan', 'tolong', 'dong',
        'berapa', 'seperti', 'sama', 'cara', 'buat', 'membuat', 'berikan', 'tentang', 'nya', 'agar', 'supaya',
        'karena', 'maka', 'oleh', 'para', 'tersebut', 'secara', 'sebagai', 'antara', 'menjadi', 'harus',
        'siapa', 'kapan', 'dimana', 'mana', 'mau', 'ingin', 'tahu',
        'the', 'what', 'why', 'how', 'is', 'are', 'of', 'and', 'to', 'in', 'for', 'this', 'that', 'with',
    ];

    // Platform terms that directly pertain to GENLABS WBI usage
    private const PLATFORM_TERMS = [
        'genlabs', 'gen labs', 'wbi', 'politeknik', 'laboratorium', 'praktikum', 'modul',
        'simulasi', 'simulator', 'eksperimen', 'percobaan', 'canvas', 'kanvas', 'slider',
        'parameter', 'variabel', 'kurikulum', 'telemetri', 'riwayat', 'sesi', 'navigasi',
        'fitur', 'bantuan', 'cpl', 'vokasi', 'kemajuan',
    ];

    // Broad scientific concepts & disciplines (must NOT be rejected merely because they are not currently open)
    private const SCIENTIFIC_TERMS = [
        // Physics & Mechanics
        'newton', 'gaya', 'massa', 'percepatan', 'kecepatan', 'vektor', 'gravitasi', 'inersia',
        'gesek', 'gesekan', 'gerak', 'kinetik', 'potensial', 'momentum', 'impuls', 'tumbukan',
        'proyektil', 'parabola', 'lintasan', 'termodinamika', 'kalor', 'suhu', 'panas', 'entropi',
        'tekanan', 'fluida', 'hidrolik', 'archimedes', 'pascal', 'bernoulli', 'gelombang', 'bunyi',
        'cahaya', 'optik', 'lensa', 'refraksi', 'difraksi', 'listrik', 'arus', 'tegangan', 'hambatan',
        'ohm', 'kirchhoff', 'kapasitor', 'magnet', 'induksi', 'faraday', 'lorentz', 'atom', 'nuklir',
        'relativitas', 'kuantum',
        // Mathematics & Statistics
        'matematika', 'aljabar', 'fungsi', 'kuadrat', 'polinomial', 'linear', 'turunan', 'diferensial',
        'integral', 'kalkulus', 'matriks', 'vektor', 'sudut', 'trigonometri', 'sinus', 'cosinus',
        'tangen', 'statistika', 'probabilitas', 'peluang', 'koin', 'dadu', 'distribusi', 'normal',
        'gauss', 'rata-rata', 'median', 'modus', 'standar deviasi', 'varians', 'regresi', 'korelasi',
        'sampel', 'populasi', 'hipotesis',
        // Computer Science & Algorithms
        'algoritma', 'sorting', 'pengurutan', 'bubble sort', 'quick sort', 'merge sort', 'insertion sort',
        'searching', 'pencarian', 'binary search', 'linear search', 'graf', 'graph', 'traversal', 'bfs',
        'dfs', 'dijkstra', 'struktur data', 'array', 'linked list', 'stack', 'queue', 'tree', 'pohon',
        'kompleksitas', 'big o', 'rekursi', 'rekursif', 'pemrograman', 'logika',
        // Chemistry & Applied Sciences
        'kimia', 'asam', 'basa', 'ph', 'titrasi', 'larutan', 'konsentrasi', 'molaritas', 'mol',
        'stoikiometri', 'reaksi', 'ikatan', 'kovalen', 'ion', 'periodik', 'unsur', 'senyawa',
        'termo kimia', 'kesetimbangan', 'redoks', 'elektrolit', 'oksidasi', 'reduksi',
        // Economics & Business Modeling
        'ekonomi', 'pasar', 'permintaan', 'penawaran', 'supply', 'demand', 'ekuilibrium', 'keseimbangan',
        'elastisitas', 'biaya', 'pendapatan', 'laba', 'rugi', 'bep', 'break even', 'bunga', 'majemuk',
        'anuitas', 'present value', 'future value', 'investasi', 'neraca', 'akuntansi', 'keuangan',
        'depresiasi', 'risiko', 'emv', 'kontinjensi',
        // General scientific methodology & measurement
        'rumus', 'formula', 'persamaan', 'grafik', 'kurva', 'satuan', 'dimensi', 'pengukuran',
        'ketidakpastian', 'galat', 'presisi', 'akurasi', 'teori', 'prinsip', 'hukum', 'kausalitas',
    ];

    private const WEAK_TERMS = [
        'naik', 'turun', 'berubah', 'perubahan', 'pengaruh', 'memengaruhi', 'mempengaruhi',
        'bertambah', 'berkurang', 'membesar', 'mengecil', 'hubungan', 'hasil', 'nilai',
        'kenapa', 'mengapa', 'bagaimana', 'jelaskan', 'maksud', 'arti',
    ];

    /**
     * Check if student question is in scope.
     *
     * @param string $question
     * @param array $context active simulator context
     * @return array{verdict:string, reason:string}
     */
    public function isQuestionInSimulatorScope(string $question, array $context = []): array
    {
        $q = mb_strtolower(trim($question));

        // 1. Strict blocklist (injection, secrets, gossip, politics, food, etc.)
        foreach (self::BLOCK_PATTERNS as $pattern) {
            if (preg_match($pattern, $q)) {
                return ['verdict' => 'out', 'reason' => 'blocklist'];
            }
        }

        // 2. Check active context vocabulary
        $vocab = $this->vocabulary($context);
        foreach ($this->contentWords($q) as $word) {
            if ($this->matchesVocab($word, $vocab)) {
                return ['verdict' => 'in', 'reason' => 'context_vocabulary'];
            }
        }

        // 3. Check platform terms
        foreach (self::PLATFORM_TERMS as $term) {
            if (str_contains($q, $term)) {
                return ['verdict' => 'in', 'reason' => 'platform_term'];
            }
        }

        // 4. Check broad scientific concepts
        foreach (self::SCIENTIFIC_TERMS as $term) {
            if (str_contains($q, $term)) {
                return ['verdict' => 'in', 'reason' => 'scientific_term'];
            }
        }

        // 5. Check weak terms (ambiguous)
        foreach (self::WEAK_TERMS as $term) {
            if (preg_match('/\b' . preg_quote($term, '/') . '\b/u', $q)) {
                return ['verdict' => 'ambiguous', 'reason' => 'weak_term'];
            }
        }

        // 6. Conversational learning, natural follow-up, or general inquiry (allowed unless caught by blocklist)
        return ['verdict' => 'in', 'reason' => 'conversational_learning'];
    }

    private function vocabulary(array $context): array
    {
        $text = mb_strtolower(json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');
        $words = [];
        foreach ($this->tokenize($text) as $w) {
            if (mb_strlen($w) >= 3 && !in_array($w, self::STOPWORDS, true) && !ctype_digit($w)) {
                $words[$w] = true;
            }
        }
        return array_keys($words);
    }

    private function contentWords(string $q): array
    {
        return array_values(array_filter(
            $this->tokenize($q),
            fn ($w) => mb_strlen($w) >= 3 && !in_array($w, self::STOPWORDS, true) && !ctype_digit($w)
        ));
    }

    private function tokenize(string $text): array
    {
        return preg_split('/[^\p{L}\p{N}]+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    }

    private function matchesVocab(string $word, array $vocab): bool
    {
        foreach ($vocab as $v) {
            if ($v === $word) {
                return true;
            }
            if (mb_strlen($word) >= 5 && mb_strlen($v) >= 5 && (str_contains($v, $word) || str_contains($word, $v))) {
                return true;
            }
        }
        return false;
    }
}
