'use client'

import { useRequireAdmin } from '../../hooks/useAdminAuth';
import { AdminLayout } from '../../components/AdminLayout';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  description: string[];
  startDateReadable: string;
  endDateReadable: string;
  createdAt: string;
  updatedAt: string;
}

interface ExperienceFormData {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function ExperiencesManagement() {
  const { isAdmin, loading } = useRequireAdmin();
  const { token } = useAdminAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/experience');
      if (response.ok) {
        const data = await response.json();
        setExperiences(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchExperiences();
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        company: formData.company,
        position: formData.position,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        description: formData.description.split('\n').filter(line => line.trim()),
      };

      const url = editingExperience ? `/api/experience/${editingExperience.id}` : '/api/experience';
      const method = editingExperience ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchExperiences();
        resetForm();
        alert(editingExperience ? 'Experience updated successfully!' : 'Experience created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Error saving experience');
      console.error('Error:', error);
    }
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      description: experience.description.join('\n')
    });
    setShowForm(true);
  };

  const handleDelete = async (experience: Experience) => {
    if (!token || !confirm(`Are you sure you want to delete the experience at "${experience.company}"?`)) return;

    try {
      const response = await fetch(`/api/experience/${experience.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchExperiences();
        alert('Experience deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Error deleting experience');
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    setEditingExperience(null);
    setShowForm(false);
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Experience Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Experience
          </button>
        </div>

        {/* Experience Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingExperience ? 'Edit Experience' : 'Add New Experience'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      required
                      pattern="^\d{4}-\d{2}$"
                      placeholder="2023-01"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date (YYYY-MM) - Leave empty if current
                    </label>
                    <input
                      type="text"
                      pattern="^\d{4}-\d{2}$"
                      placeholder="2024-12 or leave empty"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description (one point per line)
                  </label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="• Led development team of 5 engineers&#10;• Implemented new features using React and Node.js&#10;• Improved application performance by 40%"
                  />
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
                    {editingExperience ? 'Update Experience' : 'Create Experience'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Experiences List */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-6 text-center">Loading experiences...</div>
          ) : experiences.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No experiences found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company & Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {experiences.map((experience) => (
                    <tr key={experience.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {experience.company}
                          </div>
                          <div className="text-sm text-gray-500">{experience.position}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{experience.startDateReadable}</div>
                          <div className="text-xs text-gray-500">to {experience.endDateReadable}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {experience.description.slice(0, 2).map((desc, index) => (
                            <div key={index} className="truncate">• {desc}</div>
                          ))}
                          {experience.description.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{experience.description.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(experience)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(experience)}
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