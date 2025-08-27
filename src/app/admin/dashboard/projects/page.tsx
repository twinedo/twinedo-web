'use client'

import { useRequireAdmin } from '../../hooks/useAdminAuth';
import { AdminLayout } from '../../components/AdminLayout';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface Project {
  id: string;
  year: string;
  platform: 'mobile' | 'website';
  tag: string;
  project_name: string;
  description: string[];
  link_appstore?: string | null;
  link_playstore?: string | null;
  link_website?: string | null;
  display: string;
  bucket: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  year: string;
  platform: 'mobile' | 'website';
  tag: string;
  project_name: string;
  description: string;
  link_appstore: string;
  link_playstore: string;
  link_website: string;
  display: string;
  bucket: string;
}

export default function ProjectsManagement() {
  const { isAdmin, loading } = useRequireAdmin();
  const { token } = useAdminAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    year: '',
    platform: 'website',
    tag: '',
    project_name: '',
    description: '',
    link_appstore: '',
    link_playstore: '',
    link_website: '',
    display: 'active',
    bucket: ''
  });

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/project');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        ...formData,
        description: formData.description.split('\n').filter(line => line.trim()),
        link_appstore: formData.link_appstore || null,
        link_playstore: formData.link_playstore || null,
        link_website: formData.link_website || null,
      };

      const url = editingProject ? `/api/project/${editingProject.id}` : '/api/project';
      const method = editingProject ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchProjects();
        resetForm();
        alert(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Error saving project');
      console.error('Error:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      year: project.year,
      platform: project.platform,
      tag: project.tag,
      project_name: project.project_name,
      description: project.description.join('\n'),
      link_appstore: project.link_appstore || '',
      link_playstore: project.link_playstore || '',
      link_website: project.link_website || '',
      display: project.display,
      bucket: project.bucket
    });
    setShowForm(true);
  };

  const handleDelete = async (project: Project) => {
    if (!token || !confirm(`Are you sure you want to delete "${project.project_name}"?`)) return;

    try {
      const response = await fetch(`/api/project/${project.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProjects();
        alert('Project deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Error deleting project');
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      year: '',
      platform: 'website',
      tag: '',
      project_name: '',
      description: '',
      link_appstore: '',
      link_playstore: '',
      link_website: '',
      display: 'active',
      bucket: ''
    });
    setEditingProject(null);
    setShowForm(false);
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Project
          </button>
        </div>

        {/* Project Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.project_name}
                      onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({...formData, platform: e.target.value as 'mobile' | 'website'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="website">Website</option>
                      <option value="mobile">Mobile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tag}
                      onChange={(e) => setFormData({...formData, tag: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bucket
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bucket}
                      onChange={(e) => setFormData({...formData, bucket: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., project-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Status
                    </label>
                    <select
                      value={formData.display}
                      onChange={(e) => setFormData({...formData, display: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter each description point on a new line"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App Store Link
                    </label>
                    <input
                      type="url"
                      value={formData.link_appstore}
                      onChange={(e) => setFormData({...formData, link_appstore: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Play Store Link
                    </label>
                    <input
                      type="url"
                      value={formData.link_playstore}
                      onChange={(e) => setFormData({...formData, link_playstore: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website Link
                    </label>
                    <input
                      type="url"
                      value={formData.link_website}
                      onChange={(e) => setFormData({...formData, link_website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-6 text-center">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No projects found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.project_name}
                          </div>
                          <div className="text-sm text-gray-500">{project.tag}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.platform === 'mobile' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {project.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.display === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {project.display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}