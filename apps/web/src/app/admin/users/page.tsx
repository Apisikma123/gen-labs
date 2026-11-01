'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  IconUsers,
  IconSearch,
  IconFilter,
  IconCheckCircle,
  IconXCircle,
  IconEye,
  IconShield,
  IconUser,
  IconClose,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconEdit,
  IconTrash,
  IconKey,
} from '@/components/icons';
import { adminApi, AdminUserModel, PaginationMeta } from '@/lib/api/admin';
import { LoadingState } from '@/components/ui/loading-state';
import { useFeedback } from '@/components/feedback';
import { useAuth } from '@/components/auth-provider';

export default function AdminUsersPage() {
  const feedback = useFeedback();
  const { user: currentAuthUser } = useAuth();

  const [users, setUsers] = useState<AdminUserModel[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal states
  const [viewUser, setViewUser] = useState<AdminUserModel | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const [editUser, setEditUser] = useState<AdminUserModel | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await adminApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        per_page: 10,
      });
      if (res.success) {
        setUsers(res.data);
        if (res.meta) setMeta(res.meta);
      } else {
        setFetchError('Gagal memuat data pengguna dari server.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi ke server simulasi belum terhubung.';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open Edit Modal with user data
  const handleOpenEdit = (user: AdminUserModel) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      feedback.toast.error('Mohon lengkapi seluruh formulir data pengguna.');
      return;
    }
    if (createForm.password.length < 6) {
      feedback.toast.error('Kata sandi minimal 6 karakter.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await adminApi.createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      if (res.success) {
        feedback.toast.success(res.message || 'Pengguna berhasil dibuat.');
        setIsCreateOpen(false);
        setCreateForm({ name: '', email: '', password: '', role: 'student' });
        fetchUsers();
      } else {
        feedback.toast.error(res.message || 'Gagal membuat pengguna baru.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat membuat pengguna.';
      feedback.toast.error(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      feedback.toast.error('Nama dan email wajib diisi.');
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      feedback.toast.error('Kata sandi baru minimal 6 karakter.');
      return;
    }

    setEditSubmitting(true);
    try {
      const payload: { name: string; email: string; role: string; password?: string } = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await adminApi.updateUser(editUser.id, payload);
      if (res.success) {
        feedback.toast.success(res.message || 'Data pengguna berhasil diperbarui.');
        setEditUser(null);
        fetchUsers();
      } else {
        feedback.toast.error(res.message || 'Gagal memperbarui pengguna.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui pengguna.';
      feedback.toast.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Toggle User Status
  const handleToggleStatus = async (user: AdminUserModel) => {
    if (currentAuthUser && currentAuthUser.email === user.email) {
      feedback.toast.warning('Anda tidak dapat menonaktifkan akun Anda sendiri.');
      return;
    }

    const actionName = user.status === 'active' ? 'menonaktifkan' : 'mengaktifkan';
    feedback.confirm({
      title: `${user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'} Pengguna?`,
      description: `Apakah Anda yakin ingin ${actionName} akses pengguna "${user.name}" (${user.email})?`,
      variant: user.status === 'active' ? 'warning' : 'primary',
      confirmLabel: user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        try {
          const res = await adminApi.toggleUserStatus(user.id);
          if (res.success) {
            feedback.toast.success(res.message);
            fetchUsers();
          } else {
            feedback.toast.error(res.message);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal mengubah status pengguna.';
          feedback.toast.error(msg);
        }
      },
    });
  };

  // Delete User
  const handleDeleteUser = (user: AdminUserModel) => {
    if (currentAuthUser && currentAuthUser.email === user.email) {
      feedback.toast.warning('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    feedback.confirm({
      title: 'Hapus Pengguna Permanen?',
      description: `Akun "${user.name}" (${user.email}) akan dihapus secara permanen dari basis data sistem laboratorium. Tindakan ini tidak dapat dibatalkan.`,
      variant: 'danger',
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        try {
          const res = await adminApi.deleteUser(user.id);
          if (res.success) {
            feedback.toast.success(res.message || 'Pengguna berhasil dihapus.');
            fetchUsers();
          } else {
            feedback.toast.error(res.message || 'Gagal menghapus pengguna.');
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menghapus pengguna.';
          feedback.toast.error(msg);
        }
      },
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── 1. HEADER & PRIMARY ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-2.5">
            <IconUsers size={26} className="text-[var(--color-primary-accent)]" />
            <span>Manajemen Pengguna</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Kelola akun, otoritas peran administrator dan siswa laboratorium GEN LABS.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[38px] shrink-0"
        >
          <IconPlus size={16} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* ── 2. SEARCH & FILTERS ── */}
      <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari berdasarkan nama atau email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-md text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[38px]"
          />
        </div>

        {/* Role & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <IconFilter size={14} className="text-[var(--color-text-tertiary)] shrink-0 hidden md:inline" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] cursor-pointer min-h-[38px] w-full sm:w-auto"
          >
            <option value="all">Semua Peran (Role)</option>
            <option value="student">Pengguna (Mahasiswa/Siswa)</option>
            <option value="admin">Administrator</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] cursor-pointer min-h-[38px] w-full sm:w-auto"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active (Aktif)</option>
            <option value="inactive">Inactive (Nonaktif)</option>
          </select>
        </div>
      </div>

      {/* ── 3. USERS TABLE ── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingState message="Memuat daftar pengguna..." />
          </div>
        ) : fetchError ? (
          <div className="py-16 text-center space-y-3 p-4">
            <p className="text-xs text-rose-500 font-medium">{fetchError}</p>
            <button
              type="button"
              onClick={fetchUsers}
              className="px-3.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] hover:bg-[var(--color-surface)] cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--color-text-secondary)]">
            Tidak ada pengguna yang sesuai dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] font-medium">
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tanggal Daftar</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {users.map((u) => {
                  const isSelf = currentAuthUser?.email === u.email;
                  return (
                    <tr key={u.id} className="hover:bg-[var(--color-surface-subtle)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--color-text)]">
                        <div className="flex items-center gap-2">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] font-mono">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--color-text-secondary)]">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded-sm border ${
                            u.role === 'admin'
                              ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-text)] border-[var(--color-primary)]/20'
                              : 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)]'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <IconShield size={11} className="text-[var(--color-primary-text)]" />
                          ) : (
                            <IconUser size={11} className="text-[var(--color-text-secondary)]" />
                          )}
                          <span>{u.role === 'admin' ? 'Admin' : 'Pengguna'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf}
                          title={isSelf ? 'Tidak dapat mengubah status akun sendiri' : 'Klik untuk mengubah status'}
                          className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-sm border transition-opacity ${
                            isSelf ? 'opacity-80 cursor-default' : 'hover:opacity-80 cursor-pointer'
                          } ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                              : 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                          }`}
                        >
                          {u.status === 'active' ? <IconCheckCircle size={11} /> : <IconXCircle size={11} />}
                          <span>{u.status === 'active' ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[var(--color-text-tertiary)] font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail */}
                          <button
                            type="button"
                            onClick={() => setViewUser(u)}
                            title="Lihat Detail Profil"
                            className="p-1.5 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer border border-[var(--color-border-subtle)]"
                          >
                            <IconEye size={13} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Data Pengguna"
                            className="p-1.5 rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary-text)] transition-colors cursor-pointer border border-[var(--color-border-subtle)]"
                          >
                            <IconEdit size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => handleDeleteUser(u)}
                            title={isSelf ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus Pengguna'}
                            className={`p-1.5 rounded-md transition-colors border border-[var(--color-border-subtle)] ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed text-[var(--color-text-tertiary)]'
                                : 'hover:bg-rose-500/10 text-[var(--color-text-secondary)] hover:text-rose-500 hover:border-rose-500/30 cursor-pointer'
                            }`}
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta.total > meta.per_page && (
          <div className="p-3.5 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
            <span>
              Total {meta.total} pengguna (Halaman {meta.current_page} dari {meta.last_page})
            </span>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border-subtle)] disabled:opacity-40 cursor-pointer flex items-center gap-1 min-h-[34px]"
              >
                <IconChevronLeft size={13} />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border-subtle)] disabled:opacity-40 cursor-pointer flex items-center gap-1 min-h-[34px]"
              >
                <span>Berikutnya</span>
                <IconChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE USER MODAL ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <h3 className="font-heading font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                <IconPlus size={18} className="text-[var(--color-primary-accent)]" />
                <span>Tambah Pengguna Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Contoh: Budi Pratama"
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="budi@example.com"
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Peran (Role)</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px] cursor-pointer"
                >
                  <option value="student">Pengguna (Mahasiswa/Siswa Lab)</option>
                  <option value="admin">Administrator Laboratorium</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Kata Sandi Awal</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px] font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold cursor-pointer disabled:opacity-50 min-w-[90px]"
                >
                  {createSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <h3 className="font-heading font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                <IconEdit size={18} className="text-[var(--color-primary-accent)]" />
                <span>Edit Pengguna</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="p-1 rounded-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Peran (Role)</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px] cursor-pointer"
                >
                  <option value="student">Pengguna (Mahasiswa/Siswa Lab)</option>
                  <option value="admin">Administrator Laboratorium</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                    <IconKey size={13} className="text-[var(--color-text-secondary)]" />
                    <span>Kata Sandi Baru (Opsional)</span>
                  </label>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">Kosongkan jika tidak diganti</span>
                </div>
                <input
                  type="password"
                  minLength={6}
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Isi untuk mereset kata sandi"
                  className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors min-h-[36px] font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold cursor-pointer disabled:opacity-50 min-w-[90px]"
                >
                  {editSubmitting ? 'Menyimpan...' : 'Perbarui Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW USER DETAILS MODAL ── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <h3 className="font-heading font-bold text-sm sm:text-base text-[var(--color-text)] flex items-center gap-2">
                <IconEye size={16} className="text-[var(--color-primary-accent)]" />
                <span>Detail Profil Pengguna</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="p-1 rounded-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">ID Akun:</span>
                <span className="font-mono text-[var(--color-text)]">USR-{viewUser.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Nama:</span>
                <span className="font-semibold text-[var(--color-text)]">{viewUser.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Email:</span>
                <span className="font-mono text-[var(--color-text)]">{viewUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Peran:</span>
                <span className="font-semibold text-[var(--color-primary-text)] font-mono">
                  {viewUser.role === 'admin' ? 'Administrator' : 'Pengguna (Mahasiswa/Siswa)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Status:</span>
                <span className={viewUser.status === 'active' ? 'text-emerald-600 font-semibold font-mono' : 'text-rose-600 font-semibold font-mono'}>
                  {viewUser.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                <span className="text-[var(--color-text-secondary)]">Tanggal Daftar:</span>
                <span className="text-[var(--color-text)] font-mono">
                  {new Date(viewUser.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = viewUser;
                  setViewUser(null);
                  handleOpenEdit(target);
                }}
                className="px-3.5 py-1.5 rounded-md bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] cursor-pointer"
              >
                Edit Akun
              </button>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="px-4 py-1.5 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
