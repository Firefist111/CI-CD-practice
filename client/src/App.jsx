import React, { useState, useEffect } from 'react';
import './index.css';

const API = '/api/products';
export default function App() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Refresh the product list (called from event handlers)
  const fetchProducts = async () => {
    const res = await fetch(API);
    setProducts(await res.json());
  };

  // Load products on mount. setProducts runs after an await so the update
  // is asynchronous, avoiding the react-hooks/set-state-in-effect warning.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(API);
      const data = await res.json();
      if (!cancelled) setProducts(data);
    })();
    return () => { cancelled = true; };
  }, []);

  // Create or Update
  const handleSave = async (data) => {
    if (editing) {
      await fetch(`${API}/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    setModalOpen(false);
    setEditing(null);
    fetchProducts();
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (product) => { setEditing(product); setModalOpen(true); };

  return (
    <div className="app">
      <div className="header">
        <h1>PRODUCT MANAGEMENT</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="product-list">
        {products.length === 0 ? (
          <div className="empty"><p>No products yet. Add one to get started!</p></div>
        ) : (
          products.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-info">
                <h3>{p.title}</h3>
                {p.description && <p className="desc">{p.description}</p>}
                <span className="price">${Number(p.price).toFixed(2)}</span>
              </div>
              <div className="product-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <ProductForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

// Simple modal form
function ProductForm({ initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [description, setDescription] = useState(initial?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    onSave({ title, price, description });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{initial ? 'Edit Product' : 'New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} placeholder="Product name" autoFocus />
            {error && <div className="error">{error}</div>}
          </div>
          <div className="form-group">
            <label>Price ($)sjcnasjcn</label>
            <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Descriptions</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." rows="3" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
