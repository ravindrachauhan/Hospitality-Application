import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../../services/api';
import './Modal.css';

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name:'', category:'', price:'', stock:'', description:'', status:'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (initial?.id) await productService.update(initial.id, form);
      else await productService.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally { setLoading(false); }
  };
  const set = (f, v) => setForm(x => ({ ...x, [f]: v }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select Category</option>
              <option>Supplements</option><option>Equipment</option>
              <option>Accessories</option><option>Apparel</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input type="number" className="form-control" value={form.price} onChange={e => set('price', e.target.value)} required min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Qty</label>
            <input type="number" className="form-control" value={form.stock} onChange={e => set('stock', e.target.value)} min="0" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        {initial?.id && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial?.id ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}

export default function ProductsModal() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try { const res = await productService.getAll(); setProducts(res.data); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    try { await productService.delete(id); fetchProducts(); }
    catch (e) { alert('Error deleting product'); }
    setDelConfirm(null);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Products</h2>
          <p className="section-sub">{products.length} total products</p>
        </div>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>+ Add Product</button>
        </div>
      </div>

      {loading ? <div className="loading-state"><div className="spinner"></div></div> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={7} className="empty-row">No products found</td></tr>
                  : filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i+1}</td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category || '—'}</td>
                      <td><strong>₹{Number(p.price).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td><span className={`badge badge-${p.status === 'active' ? 'success' : 'danger'}`}>{p.status}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" style={{background:'#FEF3C7',color:'#D97706'}} onClick={() => setModal({type:'edit',data:p})}>✏️</button>
                          <button className="btn-icon" style={{background:'#FEE2E2',color:'#DC2626'}} onClick={() => setDelConfirm(p)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{modal.type === 'add' ? 'Add Product' : 'Edit Product'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <ProductForm initial={modal.data} onSave={() => { setModal(null); fetchProducts(); }} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="modal-close" onClick={() => setDelConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Delete <strong>{delConfirm.name}</strong>? This cannot be undone.</p>
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
