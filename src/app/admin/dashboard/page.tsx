'use client'

import { useRequireAdmin } from '../hooks/useAdminAuth';
import { AdminLayout } from '../components/AdminLayout';
import { useEffect, useState } from 'react';

type DashboardStats = {
  totalProjects: number;
  experiences: number;
  projectImages: number;
  hasCv: boolean;
};

const initialStats: DashboardStats = {
  totalProjects: 0,
  experiences: 0,
  projectImages: 0,
  hasCv: false,
};

const getCollectionCount = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const result = await response.json();
  return Array.isArray(result.data) ? result.data.length : 0;
};

const getProjectImagesCount = async () => {
  const response = await fetch('/api/project-images/test-db', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch project image stats');
  }

  const result = await response.json();
  return Number(result.data?.totalRecords ?? 0);
};

const getCvStatus = async () => {
  const response = await fetch('/api/cv', { cache: 'no-store' });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch CV status');
  }

  const result = await response.json();
  return Boolean(result.cv?.filename);
};

export default function AdminDashboard() {
  const { isAdmin, loading } = useRequireAdmin();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      setIsStatsLoading(true);
      setStatsError(null);

      try {
        const [totalProjects, experiences, projectImages, hasCv] = await Promise.all([
          getCollectionCount('/api/project'),
          getCollectionCount('/api/experience'),
          getProjectImagesCount(),
          getCvStatus(),
        ]);

        setStats({
          totalProjects,
          experiences,
          projectImages,
          hasCv,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStatsError('Failed to load dashboard overview.');
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  const formatStat = (value: number) => (isStatsLoading ? '...' : value.toString());
  const cvStatus = isStatsLoading ? '...' : stats.hasCv ? 'Uploaded' : 'Missing';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // useRequireAdmin will redirect
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
        {statsError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {statsError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
            <p className="text-2xl font-bold text-gray-900">{formatStat(stats.totalProjects)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Experiences</h3>
            <p className="text-2xl font-bold text-gray-900">{formatStat(stats.experiences)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Project Images</h3>
            <p className="text-2xl font-bold text-gray-900">{formatStat(stats.projectImages)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">CV Status</h3>
            <p className="text-2xl font-bold text-gray-900">{cvStatus}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/dashboard/projects"
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 text-center transition-colors"
            >
              <div className="text-blue-600 font-medium">Manage Projects</div>
              <div className="text-sm text-blue-500">Add, edit, or delete projects</div>
            </a>
            
            <a
              href="/admin/dashboard/experiences"
              className="bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 text-center transition-colors"
            >
              <div className="text-green-600 font-medium">Manage Experiences</div>
              <div className="text-sm text-green-500">Update work history</div>
            </a>
            
            <a
              href="/admin/dashboard/images"
              className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg border border-purple-200 text-center transition-colors"
            >
              <div className="text-purple-600 font-medium">Manage Images</div>
              <div className="text-sm text-purple-500">Upload and organize project images</div>
            </a>
            
            <a
              href="/admin/dashboard/cv"
              className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg border border-orange-200 text-center transition-colors"
            >
              <div className="text-orange-600 font-medium">Update CV</div>
              <div className="text-sm text-orange-500">Upload new CV file</div>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
