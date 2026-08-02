import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  Trash2,
  RotateCcw,
  XCircle,
  Pencil,
  FolderPlus,
  Share2,
  ShieldOff,
  LogIn,
  Clock,
  Trash,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Icon + label + color for each action type logged by the backend
const ACTION_META = {
  upload: { Icon: Upload, label: 'Uploaded', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  delete: { Icon: Trash2, label: 'Moved to trash', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  restore: { Icon: RotateCcw, label: 'Restored', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  permanent_delete: { Icon: XCircle, label: 'Permanently deleted', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  rename: { Icon: Pencil, label: 'Renamed', color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-100 dark:bg-accent-900/30' },
  create_folder: { Icon: FolderPlus, label: 'Created folder', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  share: { Icon: Share2, label: 'Shared', color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-100 dark:bg-accent-900/30' },
  unshare: { Icon: ShieldOff, label: 'Unshared', color: 'text-neutral-500', bg: 'bg-neutral-200 dark:bg-neutral-700' },
  login: { Icon: LogIn, label: 'Logged in', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const PAGE_SIZE = 20;

const ActivityPage = () => {
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadActivity = useCallback(async (targetPage) => {
    setLoading(true);
    try {
      const response = await activityAPI.getActivity(targetPage, PAGE_SIZE);
      setActivity(response.data.activity);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleClear = async () => {
    if (!window.confirm('Clear all activity history? This cannot be undone.')) return;
    try {
      await activityAPI.clearActivity();
      setActivity([]);
      setTotal(0);
      setTotalPages(1);
      setPage(1);
      toast.success('Activity history cleared');
    } catch (error) {
      toast.error('Failed to clear activity');
    }
  };

  const goPrev = () => setPage((p) => Math.max(p - 1, 1));
  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-surface-dark font-body">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Drive
        </button>

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-display font-extrabold text-neutral-900 dark:text-white">
            Activity
          </h1>
          {total > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash size={14} className="mr-1.5" />
              Clear
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-surfaceMuted-dark rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-subtle overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : activity.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-neutral-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-display font-bold text-neutral-900 dark:text-white mb-1.5">No activity yet</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Actions like uploads, deletes, and shares will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {activity.map((entry) => {
                const meta = ACTION_META[entry.action] || ACTION_META.upload;
                const { Icon, label, color, bg } = meta;
                return (
                  <li key={entry.id} className="flex items-center px-5 py-3.5">
                    <div className={`${bg} p-2 rounded-xl mr-3 flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 dark:text-neutral-200">
                        <span className="font-medium">{label}</span>{' '}
                        <span className="text-neutral-500 dark:text-neutral-400 truncate">{entry.targetName}</span>
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400 flex-shrink-0 ml-2 whitespace-nowrap">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!loading && total > 0 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Page {page} of {totalPages} &middot; {total} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={page <= 1}
                className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ChevronLeft size={15} className="mr-1" />
                Prev
              </button>
              <button
                onClick={goNext}
                disabled={page >= totalPages}
                className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Next
                <ChevronRight size={15} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;