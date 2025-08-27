'use client'

import { useRequireAdmin } from '../hooks/useAdminAuth';
import { AdminLayout } from '../components/AdminLayout';

export default function AdminDashboard() {
  const { isAdmin, loading } = useRequireAdmin();

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Experiences</h3>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Project Images</h3>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">CV Status</h3>
            <p className="text-2xl font-bold text-gray-900">--</p>
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