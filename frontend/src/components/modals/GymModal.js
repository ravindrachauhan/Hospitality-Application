import React, { useState, useEffect, useCallback } from 'react';
import { gymService } from '../../services/api';
import './Modal.css';

const CAT_COLORS = {
  'Mind & Body': '#7C3AED', 'Cardio': '#EF4444', 'Strength': '#F59E0B',
  'HIIT': '#10B981', 'Combat Sports': '#3B82F6', 'default': '#6B7280'
};

function ActivityForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name:'', category:'', description:'', duration_minutes:'', trainer:'', capacity:'20', schedule:'', status:'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (initial?.id) await gymService.update(initial.id, form);
      else await gymService.create(form);
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Error saving activity'); }
    setLoading(false);
  };
  const set = (f, v) => setForm(x => ({ ...x, [f]: v }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Activity Name *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select</option>
              <option>Mind & Body</option><option>Cardio</option><option>Strength</option>
              <option>HIIT</option><option>Combat Sports</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Duration (mins)</label>
            <input type="number" className="form-control" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} min="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Capacity</label>
            <input type="number" className="form-control" value={form.capacity} onChange={e => set('capacity', e.target.value)} min="1" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Trainer</label>
            <input className="form-control" value={form.trainer} onChange={e => set('trainer', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Schedule</label>
            <input className="form-control" value={form.schedule} onChange={e => set('schedule', e.target.value)} placeholder="e.g. Mon-Wed-Fri 7:00 AM" />
          </div>
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
          {loading ? 'Saving...' : initial?.id ? 'Update Activity' : 'Add Activity'}
        </button>
      </div>
    </form>
  );
}

export default function GymModal() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try { const res = await gymService.getAll(); 
      setActivities(res.data.data || res.data || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleDelete = async (id) => {
    try { await gymService.delete(id); fetchActivities(); }
    catch (e) { alert('Error deleting activity'); }
    setDelConfirm(null);
  };
 
  const filtered = activities.filter(a =>
  (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
  (a.category || '').toLowerCase().includes(search.toLowerCase()) ||
  (a.trainer || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">GYM Activities</h2>
          <p className="section-sub">{activities.length} activities available</p>
        </div>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." />
          </div>
          <button className="btn btn-primary" onClick={() => setModal({type:'add'})}>+ Add Activity</button>
        </div>
      </div>

      {loading ? <div className="loading-state"><div className="spinner"></div></div> : (
        <div className="gym-grid">
          {filtered.length === 0 ? <p style={{color:'var(--text-muted)', gridColumn:'1/-1', textAlign:'center', padding:40}}>No activities found</p>
            : filtered.map(a => (
              <div key={a.id} className="activity-card" style={{borderTopColor: CAT_COLORS[a.category] || CAT_COLORS.default}}>
                <div className="activity-card-header">
                  <div className="activity-name">{a.name}</div>
                  {a.category && <span className="activity-category" style={{background:`${CAT_COLORS[a.category] || CAT_COLORS.default}18`, color: CAT_COLORS[a.category] || CAT_COLORS.default}}>{a.category}</span>}
                </div>
                {a.description && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:12}}>{a.description}</p>}
                <div className="activity-info">
                  {a.trainer && <span>👤 {a.trainer}</span>}
                  {a.duration_minutes && <span>⏱ {a.duration_minutes} minutes</span>}
                  {a.capacity && <span>👥 Capacity: {a.capacity} people</span>}
                  {a.schedule && <span>📅 {a.schedule}</span>}
                </div>
                <div className="activity-card-footer">
                  <span className={`badge badge-${a.status === 'active' ? 'success' : 'danger'}`}>{a.status}</span>
                  <div className="action-btns">
                    <button className="btn-icon" style={{background:'#FEF3C7',color:'#D97706'}} onClick={() => setModal({type:'edit',data:a})}>✏️</button>
                    <button className="btn-icon" style={{background:'#FEE2E2',color:'#DC2626'}} onClick={() => setDelConfirm(a)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{modal.type === 'add' ? 'Add GYM Activity' : 'Edit Activity'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <ActivityForm initial={modal.data} onSave={() => { setModal(null); fetchActivities(); }} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:400}}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Activity</h3>
              <button className="modal-close" onClick={() => setDelConfirm(null)}>✕</button>
            </div>
            <div className="modal-body"><p>Delete <strong>{delConfirm.name}</strong>?</p></div>
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
