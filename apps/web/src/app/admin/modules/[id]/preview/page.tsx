'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconEdit,
  IconSend,
  IconEye,
  IconShieldCheck,
  IconCheckCircle,
  IconClock,
} from '@/components/icons';
import { modulesApi, ModuleModel } from '@/lib/api/modules';
import { ModuleWorkspace } from '@/components/module/module-workspace';
import { useFeedback } from '@/components/feedback';

export default function AdminModulePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = use(params);
  const router = useRouter();
  const feedback = useFeedback();
  const [module, setModule] = useState<ModuleModel | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    modulesApi.getById(resolved.id).then((res) => {
      if (res.success && res.module) {
        setModule(res.module);
      }
    });
  }, [resolved.id]);

  const handlePublish = async () => {
    if (!module) return;
    feedback.confirm({
      title: 'Terbitkan Modul Ini?',
      description: 'Modul simulator ini akan dapat diakses secara publik oleh seluruh siswa dan pengajar.',
      targetName: module.title,
      variant: 'primary',
      confirmLabel: 'Terbitkan Sekarang',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        setPublishing(true);
        try {
          await modulesApi.adminUpdate(module.id, { status: 'published' });
          feedback.toast.success('Modul simulator berhasil diterbitkan ke katalog laboratorium.');
          router.push('/admin/modules');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menerbitkan modul.';
          feedback.toast.error(msg);
          throw err;
        } finally {
          setPublishing(false);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* IT Admin Preview Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
          <IconShieldCheck size={16} />
          <span>
            Mode Pratinjau IT Admin — Status saat ini: <strong>{module?.status?.toUpperCase() || 'DRAFT'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/modules/${resolved.id}/edit`}
            className="px-3 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text)] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <IconEdit size={12} />
            <span>Edit Modul</span>
          </Link>

          {module?.status !== 'published' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="px-3 py-1 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <IconSend size={12} />
              <span>{publishing ? 'Menerbitkan...' : 'Terbitkan Sekarang'}</span>
            </button>
          )}

          <Link
            href="/admin/modules"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            Tutup Pratinjau
          </Link>
        </div>
      </div>

      {/* Render the actual student module workspace */}
      <div className="flex-1">
        <ModuleWorkspace moduleSlugOrId={resolved.id} />
      </div>
    </div>
  );
}
