<?php

namespace App\Services\AI;

use App\Models\Simulation;

class TutorService
{
    /**
     * Provide pedagogical, context-grounded AI tutoring using live simulation state
     */
    public function answer(string $question, ?Simulation $simulation = null, array $state = []): array
    {
        $q = strtolower(trim($question));
        $simSlug = $simulation ? $simulation->slug : 'unknown';

        // Check for Vector math queries (e.g. "Kenapa resultannya 10 N?")
        if (str_contains($q, 'resultan') || str_contains($q, 'vektor') || str_contains($q, 'arah')) {
            $ax = (float)($state['ax'] ?? 4);
            $ay = (float)($state['ay'] ?? 3);
            $bx = (float)($state['bx'] ?? 2);
            $by = (float)($state['by'] ?? 5);
            $rx = (float)($state['rx'] ?? ($ax + $bx));
            $ry = (float)($state['ry'] ?? ($ay + $by));
            $magR = round(sqrt($rx * $rx + $ry * $ry), 2);
            $rawDeg = rad2deg(atan2($ry, $rx));
            $deg360 = fmod($rawDeg + 360, 360);
            $angle = ($rx == 0 && $ry == 0) ? 0 : round($deg360, 2);
            $sumSq = round($rx * $rx + $ry * $ry, 2);

            if ($rx == 0 && $ry == 0) {
                $angleExplanation = "vektor nol tanpa arah tertentu (0°)";
            } elseif ($rx == 0) {
                $angleExplanation = $ry > 0 ? "tepat vertikal ke atas (θ = 90°)" : "tepat vertikal ke bawah (θ = 270°)";
            } elseif ($ry == 0) {
                $angleExplanation = $rx > 0 ? "tepat mendatar ke kanan (θ = 0°)" : "tepat mendatar ke kiri (θ = 180°)";
            } elseif ($rx > 0 && $ry > 0) {
                $angleExplanation = "berada di Kuadran I dengan rumus θ = tan⁻¹({$ry} / {$rx}) = {$angle}°";
            } elseif ($rx < 0 && $ry >= 0) {
                $absRy = abs($ry);
                $absRx = abs($rx);
                $angleExplanation = "berada di Kuadran II dengan rumus θ = 180° - tan⁻¹({$absRy} / {$absRx}) = {$angle}°";
            } elseif ($rx < 0 && $ry < 0) {
                $absRy = abs($ry);
                $absRx = abs($rx);
                $angleExplanation = "berada di Kuadran III dengan rumus θ = 180° + tan⁻¹({$absRy} / {$absRx}) = {$angle}°";
            } else {
                $absRy = abs($ry);
                $absRx = abs($rx);
                $angleExplanation = "berada di Kuadran IV dengan rumus θ = 360° - tan⁻¹({$absRy} / {$absRx}) = {$angle}°";
            }

            return [
                'answer' => "Besar resultan vektor bernilai {$magR} N. Nilai ini diperoleh dengan menjumlahkan kuadrat komponen mendatar (Rx = {$rx} N) dan tegak (Ry = {$ry} N) menggunakan rumus Pythagoras: |R| = √({$rx}² + {$ry}²) = √{$sumSq} = {$magR} N. Arah sudut resultan dihitung terhadap sumbu X positif: {$angleExplanation}.",
                'explanation' => "Setiap vektor diuraikan menjadi arah sumbu X dan Y, dijumlahkan, lalu digabungkan kembali untuk mencari panjang garis resultan dan sudut kemiringannya.",
                'action' => null,
                'suggestedFollowUp' => [
                    "Apa yang terjadi jika komponen mendatar Rx bernilai 0?",
                    "Kapan perkalian titik (dot product) bernilai 0?",
                ],
            ];
        }

        // Check for specific numerical queries for Newton's Law
        if (str_contains($q, 'percepatan') || str_contains($q, 'akselerasi')) {
            $force = $state['force'] ?? ($state['F'] ?? 20);
            $mass = $state['mass'] ?? ($state['m'] ?? 5);
            $friction = (float)($state['friction'] ?? 0);
            $frictionForce = round($friction * (float)$mass * 9.81, 2);
            $netForce = max(0, (float)$force - $frictionForce);
            $accel = (float)$mass > 0 ? round($netForce / (float)$mass, 2) : 0;

            return [
                'answer' => "Percepatan benda saat ini bernilai {$accel} m/s² berdasarkan Hukum II Newton (a = F_net / m). Gaya dorong sebesar {$force} N dikurangi gaya gesek {$frictionForce} N menghasilkan gaya bersih sebesar {$netForce} N. Ketika gaya tersebut bekerja pada massa {$mass} kg, percepatannya dihitung dengan membagi gaya bersih dengan massa: a = {$netForce} / {$mass} = {$accel} m/s².",
                'explanation' => "Hukum II Newton menunjukkan bahwa semakin besar gaya dorong yang kamu berikan, semakin cepat benda bergerak. Sebaliknya, semakin berat benda, percepatannya akan semakin kecil.",
                'action' => null,
                'suggestedFollowUp' => [
                    "Apa yang terjadi jika massa benda kamu gandakan?",
                    "Bagaimana pengaruh koefisien gesek terhadap percepatan benda?",
                ],
            ];
        }

        // Check for "apa yang terjadi jika..." or "coba ubah..."
        if (str_contains($q, 'ubah') || str_contains($q, 'coba') || str_contains($q, 'ganti') || str_contains($q, 'naikkan')) {
            if ($simSlug === 'newtons-second-law') {
                return [
                    'answer' => "Jika gaya dorong dinaikkan menjadi 40 N sementara massa benda tetap 5 kg, percepatan benda akan meningkat sebanding menjadi sekitar 8,00 m/s².",
                    'explanation' => "Percepatan bertambah seiring membesarnya gaya dorong jika massa benda dijaga tetap sama.",
                    'action' => [
                        'type' => 'apply_parameters',
                        'parameters' => ['force' => 40, 'mass' => 5],
                    ],
                    'suggestedFollowUp' => [
                        "Berapa percepatannya sekarang?",
                        "Bagaimana jika massanya dinaikkan juga?",
                    ],
                ];
            }
        }

        // Human-friendly variable label dictionary to prevent raw developer leaks
        $humanLabels = [
            'force' => 'Gaya Dorong',
            'mass' => 'Massa Benda',
            'friction' => 'Koefisien Gesek',
            'acceleration' => 'Percepatan',
            'velocity' => 'Kecepatan Awal',
            'angle' => 'Sudut Elevasi',
            'range' => 'Jarak Jangkauan',
            'ax' => 'Komponen Ax',
            'ay' => 'Komponen Ay',
            'bx' => 'Komponen Bx',
            'by' => 'Komponen By',
            'rx' => 'Komponen Rx',
            'ry' => 'Komponen Ry',
            'magR' => 'Besar Resultan',
            'pH' => 'Derajat Keasaman pH',
        ];

        $stateStrings = [];
        if (!empty($state['human_results'])) {
            $stateContextStr = 'dengan kondisi parameter saat ini (' . $state['human_results'] . ')';
        } else {
            foreach ($state as $k => $v) {
                if (is_scalar($v) && !str_starts_with($k, '_') && !str_contains($k, 'display') && !str_contains($k, 'spec') && isset($humanLabels[$k])) {
                    $stateStrings[] = "{$humanLabels[$k]}: {$v}";
                }
            }
            $stateContextStr = !empty($stateStrings) ? 'dengan kondisi saat ini (' . implode(', ', array_slice($stateStrings, 0, 3)) . ')' : '';
        }

        return [
            'answer' => "Pada simulasi {$simulation?->title} {$stateContextStr}, setiap nilai yang kamu ubah pada panel geser akan langsung memengaruhi gerak objek dan hasil perhitungannya. Coba amati perubahan pada tabel hasil dan langkah perhitungannya untuk melihat bagaimana rumus tersebut bekerja.",
            'explanation' => $simulation?->description ?? 'Simulasi interaktif membantumu memahami hubungan sebab-akibat antarvariabel secara langsung.',
            'action' => null,
            'suggestedFollowUp' => [
                "Bagaimana rumus dasar perhitungannya?",
                "Mengapa hasilnya bernilai demikian?",
            ],
        ];
    }
}
