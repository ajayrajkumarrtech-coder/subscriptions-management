import { useCallback, useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAdminSubscriptionsApi } from '../api/adminApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../utils/formatDate';

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminSubscriptionsApi({
        search,
        page: pagination.page,
        limit: pagination.limit,
      });
      setSubscriptions(data.subscriptions);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">All Subscriptions</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Monitor and search across all user subscriptions
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or plan..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Start Date</th>
                <th className="px-4 py-3 font-semibold">End Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                    <p className="text-lg font-medium">No subscriptions found</p>
                    <p className="mt-1 text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-4 py-4 font-medium">{sub.userName}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{sub.email}</td>
                    <td className="px-4 py-4">{sub.planName}</td>
                    <td className="px-4 py-4">{formatDate(sub.startDate)}</td>
                    <td className="px-4 py-4">{formatDate(sub.endDate)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={sub.status === 'active' ? 'active' : 'expired'}>
                        {sub.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && subscriptions.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
