import React, { useState, useEffect, useCallback, useRef } from 'react';
import { billingService, customerService } from '../../services/api';
import './Modal.css';

const PAY_STATUS = { pending:'warning', paid:'success', partial:'info', refunded:'danger' };

function ReceiptView({ bill }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Receipt - ${bill.invoice_number}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
        h2 { text-align: center; } .center { text-align: center; }
        .line { border-top: 1px dashed #ccc; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; margin: 6px 0; }
        .total { font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <div ref={printRef} className="receipt-area">
        <div className="receipt-header">
          <div style={{fontSize:32}}>🏋️</div>
          <div className="receipt-title">FitPro GYM</div>
          <div className="receipt-invoice">Invoice: {bill.invoice_number}</div>
          <div style={{fontSize:12,color:'#666'}}>{new Date(bill.bill_date).toLocaleString()}</div>
        </div>
        <hr className="receipt-divider" />
        <div className="receipt-row"><span>Customer:</span><span>{bill.customer_name || 'Walk-in'}</span></div>
        <div className="receipt-row"><span>Phone:</span><span>{bill.customer_phone || '—'}</span></div>
        <div className="receipt-row"><span>Payment:</span><span style={{textTransform:'uppercase'}}>{bill.payment_method}</span></div>
        <hr className="receipt-divider" />
        <div className="receipt-row"><span>Subtotal:</span><span>₹{Number(bill.subtotal||0).toLocaleString('en-IN')}</span></div>
        <div className="receipt-row"><span>Tax:</span><span>₹{Number(bill.tax||0).toLocaleString('en-IN')}</span></div>
        <div className="receipt-row"><span>Discount:</span><span>-₹{Number(bill.discount||0).toLocaleString('en-IN')}</span></div>
        <hr className="receipt-divider" />
        <div className="receipt-row receipt-total"><span>TOTAL:</span><span>₹{Number(bill.total_amount||0).toLocaleString('en-IN')}</span></div>
        <div className="receipt-footer">
          <p>Thank you for choosing FitPro GYM!</p>
          <p>Stay Fit, Stay Healthy 💪</p>
        </div>
      </div>
      <div className="modal-footer" style={{borderTop:'1px solid var(--border)'}}>
        <button className="btn btn-success" onClick={handlePrint}>🖨️ Print Receipt</button>
      </div>
    </div>
  );
}

function BillingForm({ initial, onSave, onClose }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initial || { customer_id:'', subtotal:'', tax:'', discount:'0', payment_method:'cash', payment_status:'pending', notes:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // customerService.getAll().then(r => setCustomers(r.data)).catch(() => {});
    customerService.getAll().then(r => setCustomers(r.data.data || r.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (initial?.id) await billingService.update(initial.id, form);
      else await billingService.create(form);
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Error saving bill'); }
    setLoading(false);
  };
  const set = (f, v) => setForm(x => ({ ...x, [f]: v }));
  const total = (parseFloat(form.subtotal)||0) + (parseFloat(form.tax)||0) - (parseFloat(form.discount)||0);

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Customer</label>
          <select className="form-control" value={form.customer_id} onChange={e => set('customer_id', e.target.value)}>
            <option value="">Walk-in Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Subtotal (₹) *</label>
            <input type="number" className="form-control" value={form.subtotal} onChange={e => set('subtotal', e.target.value)} required min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label className="form-label">Tax (₹)</label>
            <input type="number" className="form-control" value={form.tax} onChange={e => set('tax', e.target.value)} min="0" step="0.01" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Discount (₹)</label>
            <input type="number" className="form-control" value={form.discount} onChange={e => set('discount', e.target.value)} min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label className="form-label">Total (₹)</label>
            <input className="form-control" value={isNaN(total) ? '' : total.toFixed(2)} readOnly style={{background:'#f8f7ff',fontWeight:700}} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-control" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
              <option value="cash">Cash</option><option value="card">Card</option>
              <option value="online">Online</option><option value="upi">UPI</option>
            </select>
          </div>
          {initial?.id && (
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select className="form-control" value={form.payment_status} onChange={e => set('payment_status', e.target.value)}>
                <option value="pending">Pending</option><option value="paid">Paid</option>
                <option value="partial">Partial</option><option value="refunded">Refunded</option>
              </select>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial?.id ? 'Update Bill' : 'Create Bill'}
        </button>
      </div>
    </form>
  );
}

export default function BillingModal() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [receiptBill, setReceiptBill] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try { const res = await billingService.getAll(); 
      setBills(res.data.data || res.data || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleDelete = async (id) => {
    try { await billingService.delete(id); fetchBills(); }
    catch (e) { alert('Error deleting bill'); }
    setDelConfirm(null);
  };

  const filtered = bills.filter(b =>
    b.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Billing & Receipts</h2>
          <p className="section-sub">{bills.length} total bills</p>
        </div>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bills..." />
          </div>
          <button className="btn btn-primary" onClick={() => setModal({type:'add'})}>+ New Bill</button>
        </div>
      </div>

      {loading ? <div className="loading-state"><div className="spinner"></div></div> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Total</th><th>Method</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={7} className="empty-row">No bills found</td></tr>
                  : filtered.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.invoice_number}</strong></td>
                      <td>{b.customer_name || 'Walk-in'}</td>
                      <td>{new Date(b.bill_date).toLocaleDateString()}</td>
                      <td><strong>₹{Number(b.total_amount||0).toLocaleString('en-IN')}</strong></td>
                      <td style={{textTransform:'capitalize'}}>{b.payment_method}</td>
                      <td><span className={`badge badge-${PAY_STATUS[b.payment_status]}`}>{b.payment_status}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" style={{background:'#D1FAE5',color:'#059669'}} onClick={() => setReceiptBill(b)} title="Print Receipt">🖨️</button>
                          <button className="btn-icon" style={{background:'#FEF3C7',color:'#D97706'}} onClick={() => setModal({type:'edit',data:b})}>✏️</button>
                          <button className="btn-icon" style={{background:'#FEE2E2',color:'#DC2626'}} onClick={() => setDelConfirm(b)}>🗑️</button>
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
              <h3 className="modal-title">{modal.type === 'add' ? 'Create New Bill' : 'Edit Bill'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <BillingForm initial={modal.data} onSave={() => { setModal(null); fetchBills(); }} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {receiptBill && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReceiptBill(null)}>
          <div className="modal" style={{maxWidth:420}}>
            <div className="modal-header">
              <h3 className="modal-title">Receipt - {receiptBill.invoice_number}</h3>
              <button className="modal-close" onClick={() => setReceiptBill(null)}>✕</button>
            </div>
            <ReceiptView bill={receiptBill} />
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Bill</h3>
              <button className="modal-close" onClick={() => setDelConfirm(null)}>✕</button>
            </div>
            <div className="modal-body"><p>Delete invoice <strong>{delConfirm.invoice_number}</strong>?</p></div>
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
