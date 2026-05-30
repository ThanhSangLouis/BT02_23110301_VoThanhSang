import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { voucherAPI } from '../../api/voucher.api';

const emptyTier = { minOrderValue: 0, discountType: 'percent', discountValue: 0, maxDiscount: null };

const normalizeVoucherPayload = (raw) => {
  const payload = { ...raw };
  payload.code = String(payload.code || '').trim().toUpperCase();
  payload.title = payload.title || '';
  payload.description = payload.description || '';
  payload.isActive = payload.isActive !== false;

  payload.usageLimitTotal = payload.usageLimitTotal === '' || payload.usageLimitTotal == null
    ? null
    : Number(payload.usageLimitTotal);
  payload.usageLimitPerUser = payload.usageLimitPerUser === '' || payload.usageLimitPerUser == null
    ? 1
    : Number(payload.usageLimitPerUser);

  payload.startDate = payload.startDate || null;
  payload.endDate = payload.endDate || null;

  payload.tiers = (payload.tiers || []).map((t) => ({
    minOrderValue: Number(t.minOrderValue || 0),
    discountType: t.discountType === 'fixed' ? 'fixed' : 'percent',
    discountValue: Number(t.discountValue || 0),
    maxDiscount: t.maxDiscount === '' || t.maxDiscount == null ? null : Number(t.maxDiscount),
  }));

  return payload;
};

export default function AdminVouchersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [q, setQ] = useState('');

  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const initialForm = useMemo(
    () => ({
      code: '',
      title: '',
      description: '',
      isActive: true,
      startDate: '',
      endDate: '',
      usageLimitTotal: '',
      usageLimitPerUser: 1,
      tiers: [{ ...emptyTier }],
    }),
    []
  );

  const [form, setForm] = useState(initialForm);

  const fetchList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await voucherAPI.adminList({ page, limit: pagination.limit, q });
      const payload = res?.data ?? res;
      setList(payload.vouchers || []);
      setPagination(payload.pagination || pagination);
    } catch (e) {
      toast.error(e?.message || e || 'Không thể tải vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      code: v.code || '',
      title: v.title || '',
      description: v.description || '',
      isActive: v.isActive !== false,
      startDate: v.startDate ? new Date(v.startDate).toISOString().slice(0, 10) : '',
      endDate: v.endDate ? new Date(v.endDate).toISOString().slice(0, 10) : '',
      usageLimitTotal: v.usageLimitTotal ?? '',
      usageLimitPerUser: v.usageLimitPerUser ?? 1,
      tiers: Array.isArray(v.tiers) && v.tiers.length > 0 ? v.tiers : [{ ...emptyTier }],
    });
    setShowModal(true);
  };

  const save = async () => {
    const payload = normalizeVoucherPayload(form);

    if (!payload.code) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }
    if (!payload.tiers || payload.tiers.length === 0) {
      toast.error('Voucher phải có ít nhất 1 tier');
      return;
    }

    setSaving(true);
    try {
      if (editing?._id) {
        await voucherAPI.adminUpdate(editing._id, payload);
        toast.success('Cập nhật voucher thành công');
      } else {
        await voucherAPI.adminCreate(payload);
        toast.success('Tạo voucher thành công');
      }
      setShowModal(false);
      await fetchList(1);
    } catch (e) {
      toast.error(e?.message || e || 'Lưu voucher thất bại');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa voucher này?')) return;
    setDeletingId(id);
    try {
      await voucherAPI.adminDelete(id);
      toast.success('Đã xóa voucher');
      await fetchList(pagination.page);
    } catch (e) {
      toast.error(e?.message || e || 'Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const addTier = () => setForm((p) => ({ ...p, tiers: [...(p.tiers || []), { ...emptyTier }] }));
  const removeTier = (idx) => setForm((p) => ({ ...p, tiers: (p.tiers || []).filter((_, i) => i !== idx) }));
  const updateTier = (idx, key, value) => setForm((p) => ({
    ...p,
    tiers: (p.tiers || []).map((t, i) => (i === idx ? { ...t, [key]: value } : t)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Voucher</h1>
          <p className="text-sm text-gray-500">Quản lý voucher tiered (theo mức đơn hàng)</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          + Tạo voucher
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo code..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={() => fetchList(1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Tìm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Tiêu đề</th>
                <th className="text-left p-3">Trạng thái</th>
                <th className="text-left p-3">Used</th>
                <th className="text-left p-3">Thời gian</th>
                <th className="text-right p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-6 text-center text-gray-500" colSpan={6}>Đang tải...</td></tr>
              ) : list.length === 0 ? (
                <tr><td className="p-6 text-center text-gray-500" colSpan={6}>Chưa có voucher</td></tr>
              ) : (
                list.map((v) => (
                  <tr key={v._id} className="border-t">
                    <td className="p-3 font-semibold">{v.code}</td>
                    <td className="p-3">{v.title || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">{v.usedCount ?? 0}{v.usageLimitTotal ? `/${v.usageLimitTotal}` : ''}</td>
                    <td className="p-3 text-gray-600">
                      {v.startDate ? new Date(v.startDate).toLocaleDateString() : '—'} → {v.endDate ? new Date(v.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => openEdit(v)} className="px-3 py-1 border rounded hover:bg-gray-50">Sửa</button>
                      <button
                        onClick={() => remove(v._id)}
                        disabled={deletingId === v._id}
                        className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === v._id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between text-sm text-gray-600 border-t">
          <span>
            Trang {pagination.page}/{pagination.totalPages || 1} • Tổng {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchList(Math.max(1, pagination.page - 1))}
            >
              ← Trước
            </button>
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchList(Math.min(pagination.totalPages, pagination.page + 1))}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editing ? `Sửa voucher ${editing.code}` : 'Tạo voucher'}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="VD: SAVE10"
                    disabled={Boolean(editing)}
                  />
                  {editing && <p className="text-xs text-gray-500 mt-1">Không cho đổi code sau khi tạo.</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === 'true' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giới hạn / user</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimitPerUser}
                    onChange={(e) => setForm((p) => ({ ...p, usageLimitPerUser: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giới hạn tổng (để trống = không giới hạn)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimitTotal}
                    onChange={(e) => setForm((p) => ({ ...p, usageLimitTotal: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="border rounded-lg">
                <div className="p-3 border-b flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Tiers</p>
                    <p className="text-xs text-gray-500">Chọn tier có minOrderValue cao nhất mà đơn đạt.</p>
                  </div>
                  <button onClick={addTier} className="px-3 py-1 border rounded hover:bg-gray-50">+ Thêm tier</button>
                </div>

                <div className="p-3 space-y-3">
                  {(form.tiers || []).map((t, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Min order</label>
                        <input
                          type="number"
                          min={0}
                          value={t.minOrderValue}
                          onChange={(e) => updateTier(idx, 'minOrderValue', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Loại</label>
                        <select
                          value={t.discountType}
                          onChange={(e) => updateTier(idx, 'discountType', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="percent">Percent (%)</option>
                          <option value="fixed">Fixed (đ)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Giá trị</label>
                        <input
                          type="number"
                          min={0}
                          value={t.discountValue}
                          onChange={(e) => updateTier(idx, 'discountValue', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Max discount (optional)</label>
                        <input
                          type="number"
                          min={0}
                          value={t.maxDiscount ?? ''}
                          onChange={(e) => updateTier(idx, 'maxDiscount', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          disabled={(form.tiers || []).length <= 1}
                          onClick={() => removeTier(idx)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          Xóa tier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-gray-300"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
