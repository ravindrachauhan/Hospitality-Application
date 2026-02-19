import React, { useState, useEffect, useCallback } from 'react';
import { customerService } from '../../services/api';
import './Modal.css';

function CustomerForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name:'', email:'', phone:'', address:'', membership_type:'basic', status:'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (initial?.id) await customerService.update(initial.id, form);
      else await customerService.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving customer');
    } finally { setLoading(false); }
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea className="form-control" rows={2} value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Membership Type</label>
            <select className="form-control" value={form.membership_type} onChange={e => set('membership_type', e.target.value)}>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          {initial?.id && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial?.id ? 'Update Customer' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
}

function DetailModal({ customer, onClose }) {
  return (
    <div className="detail-card">
      <div className="detail-avatar">{customer.name.charAt(0)}</div>
      <h3 className="detail-name">{customer.name}</h3>
      <span className={`badge badge-${customer.membership_type}`}>{customer.membership_type.toUpperCase()}</span>
      <div className="detail-grid">
        <div className="detail-item"><span className="detail-label">📧 Email</span><span>{customer.email || '—'}</span></div>
        <div className="detail-item"><span className="detail-label">📱 Phone</span><span>{customer.phone || '—'}</span></div>
        <div className="detail-item"><span className="detail-label">📍 Address</span><span>{customer.address || '—'}</span></div>
        <div className="detail-item"><span className="detail-label">📅 Join Date</span><span>{new Date(customer.created_at).toLocaleDateString()}</span></div>
        <div className="detail-item"><span className="detail-label">✅ Status</span><span className={`badge badge-${customer.status === 'active' ? 'success' : 'danger'}`}>{customer.status}</span></div>
      </div>
      <div className="modal-footer" style={{borderTop:'1px solid var(--border)', marginTop:20}}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function CustomersModal() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // {type: 'add'|'edit'|'detail', data}
  const [delConfirm, setDelConfirm] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      // setCustomers(res.data);
      setCustomers(res.data.data || res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id) => {
    try {
      await customerService.delete(id);
      fetchCustomers();
    } catch (e) { alert('Error deleting customer'); }
    setDelConfirm(null);
  };

  const filtered = customers.filter(c =>
  (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
  (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
  (c.phone || '').includes(search)
  );

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Customers</h2>
          <p className="section-sub">{customers.length} total customers</p>
        </div>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." />
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>+ Add Customer</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div></div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Phone</th><th>Email</th>
                  <th>Membership</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="empty-row">No customers found</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i+1}</td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td><span className={`badge badge-${c.membership_type}`}>{c.membership_type}</span></td>
                    <td><span className={`badge badge-${c.status === 'active' ? 'success' : 'danger'}`}>{c.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" style={{background:'#EEF2FF',color:'#4F46E5'}} onClick={() => setModal({type:'detail',data:c})} title="View">👁</button>
                        <button className="btn-icon" style={{background:'#FEF3C7',color:'#D97706'}} onClick={() => setModal({type:'edit',data:c})} title="Edit">✏️</button>
                        <button className="btn-icon" style={{background:'#FEE2E2',color:'#DC2626'}} onClick={() => setDelConfirm(c)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{modal.type === 'add' ? 'Add New Customer' : 'Edit Customer'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <CustomerForm initial={modal.data} onSave={() => { setModal(null); fetchCustomers(); }} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modal?.type === 'detail' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Customer Details</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <DetailModal customer={modal.data} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="modal-close" onClick={() => setDelConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{delConfirm.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(delConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
