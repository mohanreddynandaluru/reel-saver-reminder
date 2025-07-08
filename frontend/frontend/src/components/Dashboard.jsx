import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MoreVertical, Instagram, Clock, Trash2, Edit3, Filter, Calendar, BookmarkPlus, Heart, MessageCircle, Share } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedNote, setSelectedNote] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Fetch notes from backend API
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        // Redirect to login if no token
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3005/api/notes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('firebaseToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again.');
      // Fallback to mock data for demonstration
      setNotes(mockNotes);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Delete note from backend
  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3005/api/notes/${noteId}`, {
        method: 'DELETE',
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

      // Remove from local state
      setNotes(notes.filter(note => note._id !== noteId));
      setShowMenu(false);
      setSelectedNote(null);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setSelectedNote(null);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.postDetails?.caption.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'with-reminder' && note.reminder) ||
                         (filterType === 'without-reminder' && !note.reminder);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'video': return '🎥';
      case 'reel': return '';
      case 'carousel': return '📸';
      default: return '📷';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 transition-colors duration-300">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-red-400">⚠️</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
              >
                <option value="all">All Notes</option>
                <option value="with-reminder">With Reminders</option>
                <option value="without-reminder">Without Reminders</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notes found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start saving Instagram posts with notes!'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
              >
                {/* Note Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {note.postDetails?.type && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700`}>
                        🎬 Reel
                      </span>
                    )}
                    {note.reminder && (
                      <span className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        <span>Reminder set</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (selectedNote === note._id && showMenu) {
                          setShowMenu(false);
                          setSelectedNote(null);
                        } else {
                          setSelectedNote(note._id);
                          setShowMenu(true);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    {selectedNote === note._id && showMenu && (
                      <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <Link
                          to={`/notes/${note._id}/edit`}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => {
                            setShowMenu(false);
                            setSelectedNote(null);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Note</span>
                        </Link>
                        <button 
                          onClick={() => {
                            handleDeleteNote(note._id);
                            setShowMenu(false);
                            setSelectedNote(null);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Note Content */}
                <div className="mb-4">
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-2 line-clamp-2">{note.note}</p>
                  {note.postDetails?.caption && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {note.postDetails.caption}
                    </p>
                  )}
                </div>
                {/* Post Details */}
                {(note.postDetails?.author || note.url) && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      {note.postDetails?.author && (
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {note.postDetails.author}
                        </span>
                      )}
                      {note.url && (
                        <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                          View Post →
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {/* Reminder Info */}
                {note.reminder && (
                  <div className="mb-2 text-xs text-amber-600 dark:text-amber-400">
                    Reminder: {formatDate(note.reminder)}
                  </div>
                )}
                {/* Created At */}
                {note.createdAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Saved {formatDate(note.createdAt)}
                  </div>
                )}
                {/* View/Edit Buttons */}
                <div className="flex space-x-2 mt-4">
                  <Link to={`/notes/${note._id}`} className="px-4 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition">
                    View
                  </Link>
                  <Link to={`/notes/${note._id}/edit`} className="px-4 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 