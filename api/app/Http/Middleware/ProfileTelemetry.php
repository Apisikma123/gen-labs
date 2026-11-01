<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class ProfileTelemetry
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = defined('LARAVEL_START') ? LARAVEL_START : microtime(true);
        DB::enableQueryLog();

        $response = $next($request);

        $queries = DB::getQueryLog();
        $sqlDuration = array_sum(array_column($queries, 'time'));
        $totalDuration = (microtime(true) - $start) * 1000;

        $response->headers->set('X-Laravel-Exec-Ms', (string) round($totalDuration, 2));
        $response->headers->set('X-Laravel-SQL-Ms', (string) round($sqlDuration, 2));
        $response->headers->set('X-Laravel-SQL-Count', (string) count($queries));

        return $response;
    }
}
