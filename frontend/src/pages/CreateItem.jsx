import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function CreateItem() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    if (image) formData.append('image', image);
    try {
      await api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/seller');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        <Link to="/seller" className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>← Back to dashboard</Link>
        <div className="card form-enterprise animate-fade-in" style={{ padding: '2rem' }}>
          <h1 className="form-heading">Add item</h1>
          <p className="form-heading-sub">Add a new item with category and image. It will be available when you create an auction.</p>
          <form onSubmit={handleSubmit}>
            {error && <p className="msg-error">{error}</p>}
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Item name" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
            </div>
            <div className="submit-block">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating...' : 'Add item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
