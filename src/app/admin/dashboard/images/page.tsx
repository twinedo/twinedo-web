'use client'

import { useRequireAdmin } from '../../hooks/useAdminAuth';
import { AdminLayout } from '../../components/AdminLayout';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface ProjectImage {
  id: string;
  bucket: string;
  filename: string;
  isFeatured: boolean;
  isThumbnail: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  blobUrl: string;
}

interface ImageFormData {
  bucket: string;
  filename: string;
  blobUrl: string;
}

interface BucketGroup {
  bucket: string;
  images: ProjectImage[];
  count: number;
}

export default function ImagesManagement() {
  const { isAdmin, loading } = useRequireAdmin();
  const { token } = useAdminAuth();
  const [bucketGroups, setBucketGroups] = useState<BucketGroup[]>([]);
  const [allImages, setAllImages] = useState<ProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ImageFormData>({
    bucket: '',
    filename: '',
    blobUrl: ''
  });

  const fetchAllImages = async () => {
    try {
      // First get the database test to see available buckets
      const response = await fetch('/api/project-images/test-db');
      if (response.ok) {
        const data = await response.json();
        const buckets = data.data?.availableBuckets || [];
        
        // Fetch images for each bucket
        const bucketPromises = buckets.map(async (bucketInfo: { bucket: string; _count: { bucket: number } }) => {
          try {
            const imagesResponse = await fetch(`/api/images/${bucketInfo.bucket}`);
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              return {
                bucket: bucketInfo.bucket,
                images: imagesData.data || [],
                count: bucketInfo._count.bucket
              };
            }
            return {
              bucket: bucketInfo.bucket,
              images: [],
              count: bucketInfo._count.bucket
            };
          } catch (error) {
            console.error(`Error fetching images for bucket ${bucketInfo.bucket}:`, error);
            return {
              bucket: bucketInfo.bucket,
              images: [],
              count: bucketInfo._count.bucket
            };
          }
        });

        const bucketResults = await Promise.all(bucketPromises);
        setBucketGroups(bucketResults);
        
        // Flatten all images for easy access
        const flatImages = bucketResults.flatMap(group => group.images);
        setAllImages(flatImages);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllImages();
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch('/api/project-images/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchAllImages();
        resetForm();
        alert('Image metadata created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Error creating image');
      console.error('Error:', error);
    }
  };

  const handleUpdateImage = async (image: ProjectImage, updates: { isFeatured?: boolean; order?: number }) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/project-images/${image.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchAllImages();
        alert('Image updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Error updating image');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (image: ProjectImage) => {
    if (!token || !confirm(`Are you sure you want to delete "${image.filename}"?`)) return;

    try {
      const response = await fetch(`/api/project-images/${image.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAllImages();
        alert('Image deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Error deleting image');
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      bucket: '',
      filename: '',
      blobUrl: ''
    });
    setShowForm(false);
  };

  const toggleFeatured = (image: ProjectImage) => {
    handleUpdateImage(image, { isFeatured: !image.isFeatured });
  };

  const updateOrder = (image: ProjectImage, newOrder: number) => {
    handleUpdateImage(image, { order: newOrder });
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Project Images Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Image Metadata
          </button>
        </div>

        {/* Image Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Image Metadata</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bucket (Project ID)
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
                    Filename
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.filename}
                    onChange={(e) => setFormData({...formData, filename: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., screenshot-1.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blob URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.blobUrl}
                    onChange={(e) => setFormData({...formData, blobUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://your-blob-storage.com/image.png"
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
                    Create Image Metadata
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Buckets</h3>
            <p className="text-2xl font-bold text-gray-900">{bucketGroups.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Images</h3>
            <p className="text-2xl font-bold text-gray-900">{allImages.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Featured Images</h3>
            <p className="text-2xl font-bold text-gray-900">
              {allImages.filter(img => img.isFeatured).length}
            </p>
          </div>
        </div>

        {/* Images by Bucket */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">Loading images...</div>
          ) : bucketGroups.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No images found
            </div>
          ) : (
            bucketGroups.map((group) => (
              <div key={group.bucket} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Bucket: {group.bucket}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {group.count} images
                    </span>
                  </div>
                </div>

                {group.images.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No images found in this bucket
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Properties
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {group.images.map((image) => (
                          <tr key={image.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-16 w-16">
                                  <img
                                    className="h-16 w-16 rounded-md object-cover"
                                    src={image.blobUrl || `https://via.placeholder.com/64?text=${image.filename}`}
                                    alt={image.filename}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = `https://via.placeholder.com/64?text=${image.filename}`;
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {image.filename}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(image.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  image.isFeatured 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {image.isFeatured ? 'Featured' : 'Regular'}
                                </span>
                                {image.isThumbnail && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    Thumbnail
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={image.order}
                                onChange={(e) => updateOrder(image, parseInt(e.target.value))}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                                min="0"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => toggleFeatured(image)}
                                className={`${
                                  image.isFeatured 
                                    ? 'text-yellow-600 hover:text-yellow-900' 
                                    : 'text-blue-600 hover:text-blue-900'
                                }`}
                              >
                                {image.isFeatured ? 'Unfeature' : 'Feature'}
                              </button>
                              <button
                                onClick={() => handleDelete(image)}
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
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}