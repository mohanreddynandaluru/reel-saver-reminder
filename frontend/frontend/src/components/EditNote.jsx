import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function EditNote() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('firebaseToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await fetch(`http://localhost:3005/api/notes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('firebaseToken');
            navigate('/login');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNote(data);
      } catch (err) {
        setError('Failed to load note.');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('postDetails.')) {
      setNote({
        ...note,
        postDetails: {
          ...note.postDetails,
          [name.split('.')[1]]: value,
        },
      });
    } else {
      setNote({ ...note, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`http://localhost:3005/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('firebaseToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      navigate(`/notes/${id}`);
    } catch (err) {
      setError('Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!note) return <div className="p-8 text-center">Note not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-purple-600 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea name="note" value={note.note || ''} onChange={handleChange} className="w-full p-2 rounded border dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram Post URL</label>
            <input name="url" value={note.url || ''} onChange={handleChange} className="w-full p-2 rounded border dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <input name="postDetails.type" value={note.postDetails?.type || ''} onChange={handleChange} className="w-full p-2 rounded border dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Caption</label>
            <textarea name="postDetails.caption" value={note.postDetails?.caption || ''} onChange={handleChange} className="w-full p-2 rounded border dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input name="postDetails.author" value={note.postDetails?.author || ''} onChange={handleChange} className="w-full p-2 rounded border dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reminder (ISO format)</label>
            <input name="reminder" value={note.reminder || ''} onChange={handleChange} className="w-full p-2 rounded border dark:bg-gray-700 text-gray-900 dark:text-white" type="datetime-local" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-purple-700 transition-all duration-200">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default EditNote; 