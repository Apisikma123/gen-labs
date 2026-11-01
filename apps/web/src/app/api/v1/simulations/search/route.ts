import { NextResponse } from 'next/server';
import { searchSimulations, findBestSimulationMatch } from '@genlab/simulation-core';
import { SimulationStorageRepository } from '@/lib/storage/session-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = typeof body?.query === 'string' ? body.query.trim() : '';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required.' },
        { status: 400 }
      );
    }

    const results = searchSimulations(query);
    let bestMatch = findBestSimulationMatch(query, 0.65);

    // If no static match, check organic repository of previously generated templates (Section 18)
    if (!bestMatch) {
      const stored = SimulationStorageRepository.findCompatibleTemplate(query);
      if (stored) {
        bestMatch = {
          simulationId: stored.slug,
          slug: stored.slug,
          title: stored.title,
          domain: stored.domain,
          engine: stored.engine as any,
          version: stored.version,
          similarityScore: 0.90,
          matchReason: 'Cocok dengan konsep riwayat template organik',
          isExactMatch: true,
          concepts: stored.definition.concepts || [],
        };
      }
    }

    return NextResponse.json({
      query,
      results,
      bestMatch,
      canReuse: bestMatch !== null,
    });
  } catch (error) {
    console.error('Search endpoint error:', error);
    return NextResponse.json(
      { error: "Couldn't search the simulation library." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter is required.' },
        { status: 400 }
      );
    }

    const results = searchSimulations(query);
    const bestMatch = findBestSimulationMatch(query, 0.65);

    return NextResponse.json({
      query,
      results,
      bestMatch,
      canReuse: bestMatch !== null,
    });
  } catch (error) {
    console.error('Search GET endpoint error:', error);
    return NextResponse.json(
      { error: "Couldn't search the simulation library." },
      { status: 500 }
    );
  }
}
