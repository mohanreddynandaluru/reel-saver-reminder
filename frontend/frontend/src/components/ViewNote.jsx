import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Edit3, ArrowLeft } from 'lucide-react';

function ViewNote() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!note) return <div className="p-8 text-center">Note not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-purple-600 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">View Note</h2>
          <Link to={`/notes/${id}/edit`} className="flex items-center text-purple-600 hover:underline">
            <Edit3 className="h-4 w-4 mr-1" /> Edit
          </Link>
        </div>
        <div className="mb-4">
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{note.note}</div>
          {note.postDetails?.caption && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{note.postDetails.caption}</div>
          )}
          {note.postDetails?.author && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">By: {note.postDetails.author}</div>
          )}
          {note.url && (
            <div className="mb-2">
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">View Instagram Post</a>
            </div>
          )}
          {note.postDetails?.type && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Type: {note.postDetails.type}</div>
          )}
          {note.reminder && (
            <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 mb-2">
              <Clock className="h-4 w-4 mr-1" /> Reminder: {new Date(note.reminder).toLocaleString()}
            </div>
          )}
          {note.createdAt && (
            <div className="text-xs text-gray-400">Created: {new Date(note.createdAt).toLocaleString()}</div>
          )}
        </div>
        {/* Show any other fields if needed */}
      </div>
    </div>
  );
}

export default ViewNote; 