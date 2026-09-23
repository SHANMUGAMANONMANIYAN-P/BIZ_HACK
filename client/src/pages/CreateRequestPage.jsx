import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Users,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateRequestPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Events');
  const [location, setLocation] = useState('College Auditorium');
  const [requiredDate, setRequiredDate] = useState('2026-09-25');
  const [requiredTime, setRequiredTime] = useState('09:00 AM');
  const [urgency, setUrgency] = useState('Medium');
  const [helpersRequired, setHelpersRequired] = useState(5);
  const [circleId, setCircleId] = useState('');
  const [circles, setCircles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCircles = async () => {
      try {
        const res = await api.get('/circles');
        if (res.data.success) {
          setCircles(res.data.data);
          // Default to first circle if present
          if (res.data.data.length > 0) {
            setCircleId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching circles:', err);
      }
    };

    fetchCircles();
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location || !requiredDate || !requiredTime) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/requests', {
        title,
        description,
        category,
        location,
        requiredDate,
        requiredTime,
        urgency,
        helpersRequired: parseInt(helpersRequired, 10),
        circleId: circleId === 'global' ? null : circleId || null,
      });

      if (res.data.success) {
        navigate(`/requests/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post help request.');
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-fill scenario button
  const handleAutoFillDemo = () => {
    setTitle('Need 5 volunteers for college event setup');
    setDescription('Need students to help arrange chairs, audio equipment, and badges for the annual symposium.');
    setCategory('Events');
    setLocation('College Auditorium');
    setRequiredDate('2026-09-25');
    setRequiredTime('09:00 AM');
    setUrgency('Medium');
    setHelpersRequired(5);
    const collegeCircle = circles.find((c) => c.name.includes('College Volunteers'));
    if (collegeCircle) setCircleId(collegeCircle._id);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Coordinated Community Request</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Create a Help Request
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ask for individual assistance or coordinate multiple helpers for large tasks.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
          >
            ⚡ Auto-Fill Hackathon Demo Data
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need 5 volunteers for college event setup"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the task, what helpers will do, and any specific requirements..."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Category & Help Circle Scoping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Education">Education</option>
                <option value="Technology">Technology</option>
                <option value="Events">Events</option>
                <option value="Transportation">Transportation</option>
                <option value="Household">Household</option>
                <option value="Moving">Moving</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Scope to Help Circle</span>
                <span className="text-[10px] text-indigo-600 font-normal">Novelty Feature</span>
              </label>
              <select
                value={circleId}
                onChange={(e) => setCircleId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="global">🌐 Global (All Community Members)</option>
                {circles.map((c) => (
                  <option key={c._id} value={c._id}>
                    👥 {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Helpers Required & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                Required Helpers (Multi-Helper Capacity)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={helpersRequired}
                onChange={(e) => setHelpersRequired(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                required
              />
              <span className="text-[10px] text-indigo-700 mt-1 block">
                Supports coordinating multiple helpers (e.g. 5 volunteers) on a single task.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Low">Low (Flexible schedule)</option>
                <option value="Medium">Medium (Needed this week)</option>
                <option value="High">High (Urgent assistance required)</option>
              </select>
            </div>
          </div>

          {/* Location & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. College Auditorium"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Required Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Required Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={requiredTime}
                onChange={(e) => setRequiredTime(e.target.value)}
                placeholder="e.g. 09:00 AM"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-200"
            >
              {loading ? 'Publishing...' : 'Publish Help Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
