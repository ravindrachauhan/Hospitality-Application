import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/api';
import './Modal.css';

const STATUS_COLORS = { pending:'warning', processing:'info', completed:'success', cancelled:'danger' };

export default function OrdersModal() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try { const res = await orderService.getAll(); 
      setOrders(res.data.data || res.data || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (id) => {
    setDetailModal(true);
    try {
      const res = await orderService.getById(id);
      setDetailData(res.data);
    } catch (e) { setDetailData(null); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await orderService.update(id, { status });
      fetchOrders();
      setEditModal(null);
    } catch (e) { alert('Error updating order'); }
  };

  const handleDelete = async (id) => {
    try { await orderService.delete(id); fetchOrders(); }
    catch (e) { alert('Error deleting order'); }
    setDelConfirm(null);
  };

  const filtered = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search)
  );

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Orders</h2>
          <p className="section-sub">{orders.length} total orders</p>
        </div>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or ID..." />
          </div>
        </div>
      </div>

      {loading ? <div className="loading-state"><div className="spinner"></div></div> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={6} className="empty-row">No orders found</td></tr>
                  : filtered.map(o => (
                    <tr key={o.id}>
                      <td><strong>#ORD-{String(o.id).padStart(4,'0')}</strong></td>
                      <td>{o.customer_name || 'Walk-in'}</td>
                      <td>{new Date(o.order_date).toLocaleDateString()}</td>
                      <td><strong>₹{Number(o.total_amount).toLocaleString('en-IN')}</strong></td>
                      <td><span className={`badge badge-${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" style={{background:'#EEF2FF',color:'#4F46E5'}} onClick={() => openDetail(o.id)}>👁</button>
                          <button className="btn-icon" style={{background:'#FEF3C7',color:'#D97706'}} onClick={() => setEditModal(o)}>✏️</button>
                          <button className="btn-icon" style={{background:'#FEE2E2',color:'#DC2626'}} onClick={() => setDelConfirm(o)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Order Details</h3>
              <button className="modal-close" onClick={() => { setDetailModal(null); setDetailData(null); }}>✕</button>
            </div>
            <div className="modal-body">
              {!detailData ? <div className="loading-state"><div className="spinner"></div></div> : (
                <>
                  <div className="form-row" style={{marginBottom:16}}>
                    <div><strong>Order:</strong> #ORD-{String(detailData.id).padStart(4,'0')}</div>
                    <div><strong>Customer:</strong> {detailData.customer_name || 'Walk-in'}</div>
                    <div><strong>Status:</strong> <span className={`badge badge-${STATUS_COLORS[detailData.status]}`}>{detailData.status}</span></div>
                    <div><strong>Date:</strong> {new Date(detailData.order_date).toLocaleString()}</div>
                  </div>
                  <table>
                    <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {(detailData.items || []).map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                          <td>₹{Number(item.subtotal).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{textAlign:'right', marginTop:12, fontSize:16, fontWeight:700}}>
                    Total: ₹{Number(detailData.total_amount).toLocaleString('en-IN')}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setDetailModal(null); setDetailData(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal" style={{maxWidth:360}}>
            <div className="modal-header">
              <h3 className="modal-title">Update Status</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom:16}}>Change status for order <strong>#ORD-{String(editModal.id).padStart(4,'0')}</strong></p>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" defaultValue={editModal.status} id="order-status-select">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const val = document.getElementById('order-status-select').value;
                handleStatusUpdate(editModal.id, val);
              }}>Update</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Order</h3>
              <button className="modal-close" onClick={() => setDelConfirm(null)}>✕</button>
            </div>
            <div className="modal-body"><p>Delete order <strong>#ORD-{String(delConfirm.id).padStart(4,'0')}</strong>?</p></div>
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
