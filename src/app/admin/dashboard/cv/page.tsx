'use client'

import { useRequireAdmin } from '../../hooks/useAdminAuth';
import { AdminLayout } from '../../components/AdminLayout';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { downloadCV } from '@/services/cv';

interface CV {
  id: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
}

export default function CVManagement() {
  const { isAdmin, loading } = useRequireAdmin();
  const { token } = useAdminAuth();
  const [cv, setCV] = useState<CV | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchCV = async () => {
    try {
      const response = await fetch('/api/cv', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setCV(data.cv);
        return data.cv;
      }
    } catch (error) {
      console.error('Error fetching CV:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCV();
    }
  }, [isAdmin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv_file', selectedFile);

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (response.ok) {
        if (payload?.data) {
          const normalized = {
            id: payload.data.id,
            filename: payload.data.filename,
            createdAt: payload.data.createdAt
              ? new Date(payload.data.createdAt).toISOString()
              : new Date().toISOString(),
            updatedAt: payload.data.updatedAt
              ? new Date(payload.data.updatedAt).toISOString()
              : new Date().toISOString(),
          } satisfies CV;
          setCV(normalized);
        } else {
          await fetchCV();
        }
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('cv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        alert('CV uploaded successfully!');
      } else {
        const message = payload?.message || 'Something went wrong';
        alert(`Upload failed: ${message}`);
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadCV();
    } catch (error) {
      alert('Download failed. Please try again.');
      console.error('Download error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CV Management</h1>
        </div>

        {/* Current CV Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current CV</h2>
          
          {isLoading ? (
            <div className="text-center py-4">Loading CV information...</div>
          ) : cv ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-green-800">{cv.filename}</h3>
                  <p className="text-sm text-green-600">
                    Last updated: {new Date(cv.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No CV uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">Upload your first CV to get started</p>
            </div>
          )}
        </div>

        {/* Upload New CV */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {cv ? 'Update CV' : 'Upload CV'}
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File
              </label>
              <input
                id="cv-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                disabled={uploading}
              />
              <p className="mt-2 text-sm text-gray-500">
                PDF files only, maximum size 10MB
              </p>
            </div>

            {selectedFile && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Selected File:</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.getElementById('cv-file') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {cv ? 'Update CV' : 'Upload CV'}
                  </>
                )}
              </button>
            </div>
          </form>

          {cv && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Note: Uploading a new CV will replace the existing one
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    The filename will be automatically set to &quot;Twin Edo Nugraha - CV.pdf&quot;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
