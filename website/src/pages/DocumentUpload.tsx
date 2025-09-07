import React, { useState, useEffect } from 'react';
import { profileAPI } from '../services/completeAPI';

interface Document {
  _id?: string;
  documentType: string;
  documentUrl: string;
  uploadedAt: string;
  status?: string;
}

const DocumentUpload: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const documentTypes = [
    { value: 'business_license', label: 'Business License' },
    { value: 'gst_certificate', label: 'GST Certificate' },
    { value: 'pollution_control_board', label: 'Pollution Control Board NOC' },
    { value: 'waste_management_license', label: 'Waste Management License' },
    { value: 'id_proof', label: 'ID Proof (Aadhar/PAN)' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'bank_details', label: 'Bank Account Details' },
    { value: 'insurance_certificate', label: 'Insurance Certificate' }
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await profileAPI.getProfile();
      if (response.success && response.recycler?.verificationDocuments) {
        setDocuments(response.recycler.verificationDocuments);
      } else {
        // Mock documents for demonstration
        setDocuments([
          {
            _id: '1',
            documentType: 'business_license',
            documentUrl: '/uploads/business_license.pdf',
            uploadedAt: new Date().toISOString(),
            status: 'verified'
          },
          {
            _id: '2',
            documentType: 'gst_certificate',
            documentUrl: '/uploads/gst_cert.pdf',
            uploadedAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'pending'
          }
        ]);
      }
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setError('Failed to load documents');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !selectedDocType) {
      setError('Please select files and document type');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      
      // Add files to form data
      Array.from(selectedFiles).forEach((file, index) => {
        formData.append('documents', file);
      });
      
      // Add document type
      formData.append('documentType', selectedDocType);

      const response = await profileAPI.uploadDocuments(formData);
      
      if (response.success) {
        setSuccess('Documents uploaded successfully!');
        setSelectedFiles(null);
        setSelectedDocType('');
        
        // Reload documents
        await loadDocuments();
        
        // Clear the file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type.replace('_', ' ').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const requiredDocuments = [
    'business_license',
    'gst_certificate', 
    'pollution_control_board',
    'waste_management_license',
    'id_proof'
  ];

  const uploadedDocTypes = documents.map(doc => doc.documentType);
  const missingDocuments = requiredDocuments.filter(type => !uploadedDocTypes.includes(type));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800">Document Upload</h1>
        <p className="text-gray-600">Upload verification documents for your recycler account</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Verification Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Verification Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{documents.length}</div>
            <div className="text-sm text-gray-600">Documents Uploaded</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(doc => doc.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{missingDocuments.length}</div>
            <div className="text-sm text-gray-600">Missing Required</div>
          </div>
        </div>
      </div>

      {/* Missing Documents Alert */}
      {missingDocuments.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <h3 className="font-medium text-orange-800 mb-2">Missing Required Documents</h3>
          <div className="space-y-1">
            {missingDocuments.map(docType => (
              <div key={docType} className="text-sm text-orange-700">
                • {getDocumentTypeLabel(docType)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Upload New Documents</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select document type</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Files
              </label>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG (Max 5MB per file)
              </p>
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Selected Files:</h4>
                <div className="space-y-1">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFiles || !selectedDocType}
              className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Documents'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Uploaded Documents ({documents.length})
          </h2>
        </div>
        
        {documents.length > 0 ? (
          <div className="divide-y">
            {documents.map((doc, index) => (
              <div key={doc._id || index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {getDocumentTypeLabel(doc.documentType)}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status || 'pending')}`}>
                        {(doc.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(doc.documentUrl, '_blank')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.documentUrl;
                        link.download = `${doc.documentType}_${new Date(doc.uploadedAt).toLocaleDateString()}`;
                        link.click();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">📄</span>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No documents uploaded</h3>
            <p className="text-gray-600">
              Upload your verification documents to get your account approved
            </p>
          </div>
        )}
      </div>

      {/* Required Documents Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Required Documents for Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          {requiredDocuments.map(docType => (
            <div key={docType} className="flex items-center">
              <span className={`mr-2 ${uploadedDocTypes.includes(docType) ? 'text-green-600' : 'text-orange-600'}`}>
                {uploadedDocTypes.includes(docType) ? '✓' : '○'}
              </span>
              {getDocumentTypeLabel(docType)}
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-3">
          ✓ = Uploaded • ○ = Required but not uploaded
        </p>
      </div>
    </div>
  );
};

export default DocumentUpload;
