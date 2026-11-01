import { NextResponse } from 'next/server';
import { evaluateTargetCondition } from '@genlab/simulation-core';
import type { ExperimentTargetCondition } from '@genlab/simulation-types';
import { authenticateUser } from '@/lib/auth/server-guard';

export async function POST(request: Request) {
  try {
    // 1. Enforce authenticated session
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return (
        auth.errorResponse ||
        NextResponse.json(
          { success: false, error: 'Unauthenticated. Sesi login diperlukan untuk mengevaluasi eksperimen.' },
          { status: 401 }
        )
      );
    }

    // 2. Validate request JSON body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Payload body harus berupa objek JSON yang valid.' },
        { status: 400 }
      );
    }

    // 3. Validate condition presence and structure
    const condition = body.condition as ExperimentTargetCondition | string | undefined;
    if (!condition) {
      return NextResponse.json(
        { success: false, error: 'Parameter "condition" wajib disertakan untuk evaluasi target eksperimen.' },
        { status: 400 }
      );
    }

    let normalizedCondition = condition;
    if (typeof condition === 'object') {
      if (!condition.output || typeof condition.output !== 'string' || !condition.output.trim()) {
        return NextResponse.json(
          { success: false, error: 'Target condition "output" signal harus ditentukan.' },
          { status: 400 }
        );
      }
      if (typeof condition.value !== 'number' || !Number.isFinite(condition.value)) {
        return NextResponse.json(
          { success: false, error: 'Target condition "value" harus berupa angka finite yang valid.' },
          { status: 400 }
        );
      }

      // Operator normalization (support aliases like equals, greater_than, less_than)
      const opMap: Record<string, '==' | '>=' | '<=' | '>' | '<' | '!=' | 'between'> = {
        '==': '==',
        'equals': '==',
        '=': '==',
        '>=': '>=',
        'gte': '>=',
        '<=': '<=',
        'lte': '<=',
        '>': '>',
        'gt': '>',
        'greater_than': '>',
        '<': '<',
        'lt': '<',
        'less_than': '<',
        '!=': '!=',
        'between': 'between',
      };

      const rawOp = String(condition.operator || '').trim().toLowerCase();
      const mappedOp = opMap[rawOp];
      if (!mappedOp) {
        return NextResponse.json(
          { success: false, error: `Operator condition "${condition.operator}" tidak didukung.` },
          { status: 400 }
        );
      }

      normalizedCondition = {
        ...condition,
        operator: mappedOp,
      };
    } else if (typeof condition !== 'string' || !condition.trim()) {
      return NextResponse.json(
        { success: false, error: 'Format condition tidak valid.' },
        { status: 400 }
      );
    }

    // 4. Validate computed outputs
    const computed = body.computed;
    if (!computed || typeof computed !== 'object' || Array.isArray(computed)) {
      return NextResponse.json(
        { success: false, error: 'Parameter "computed" harus berupa objek key-value hasil simulasi.' },
        { status: 400 }
      );
    }

    // 5. Optional parameters type checks
    const activeParameters = body.activeParameters as Record<string, number> | undefined;
    if (activeParameters && (typeof activeParameters !== 'object' || Array.isArray(activeParameters))) {
      return NextResponse.json(
        { success: false, error: 'Parameter "activeParameters" harus berupa objek numerik.' },
        { status: 400 }
      );
    }

    const startParameters = body.startParameters as Record<string, number> | undefined;
    if (startParameters && (typeof startParameters !== 'object' || Array.isArray(startParameters))) {
      return NextResponse.json(
        { success: false, error: 'Parameter "startParameters" harus berupa objek numerik.' },
        { status: 400 }
      );
    }

    const allowedParameters = Array.isArray(body.allowedParameters) ? body.allowedParameters : undefined;

    const evaluation = evaluateTargetCondition(
      normalizedCondition,
      computed,
      activeParameters,
      startParameters,
      allowedParameters
    );

    return NextResponse.json(evaluation);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Evaluation failure.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
