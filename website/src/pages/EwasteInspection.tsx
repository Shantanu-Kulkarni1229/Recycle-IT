import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield
} from 'lucide-react';
import DeviceInspection from '../components/DeviceInspection';
import VerificationDashboard from '../components/VerificationDashboard';

interface EwasteItem {
  _id: string;
  deviceType: string;
  condition: string;
  estimatedValue: number;
  inspectionStatus?: string;
  inspectionNotes?: string;
  inspectionDate?: string;
  photos?: string[];
  pickupId?: string;
  userDetails?: any;
  brand?: string;
  model?: string;
  deviceConditionReport?: any;
  scheduledDate?: string;
  pickupAddress?: string;
}

type ViewMode = 'list' | 'inspect' | 'verification';

const EwasteInspection: React.FC = () => {
  const [ewasteItems, setEwasteItems] = useState<EwasteItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EwasteItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadEwasteItems = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Get recycler ID from local storage
        const recyclerData = localStorage.getItem('recyclerData');
        if (!recyclerData) {
          setError('Recycler data not found');
          return;
        }
        
        const { _id: recyclerId } = JSON.parse(recyclerData);
        const token = localStorage.getItem('recyclerToken');
        
        const response = await fetch(`http://localhost:5000/api/recycler-pickups/recycler/${recyclerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        
        if (result.success) {
          setEwasteItems(result.data || []);
        } else {
          setError(result.message || 'Failed to load items');
        }
      } catch (error) {
        console.error('Error loading e-waste items:', error);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEwasteItems();
  }, []);

  const getStatusIcon = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'under inspection':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'under inspection': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredItems = ewasteItems.filter(item => {
    const deviceType = item.deviceType || '';
    const brand = item.brand || '';
    const model = item.model || '';
    const inspectionStatus = item.inspectionStatus || 'pending';
    
    const matchesSearch = deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         inspectionStatus.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleInspectDevice = (item: EwasteItem) => {
    setSelectedItem(item);
    setViewMode('inspect');
  };

  const handleViewVerification = (item: EwasteItem) => {
    setSelectedItem(item);
    setViewMode('verification');
  };

  const handleInspectionComplete = (updatedData: any) => {
    // Update the item in the list
    setEwasteItems(prev => prev.map(item => 
      item._id === selectedItem?._id 
        ? { ...item, ...updatedData, inspectionStatus: 'Completed' }
        : item
    ));
    
    // Switch to verification view
    setViewMode('verification');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading e-waste items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render inspection form
  if (viewMode === 'inspect' && selectedItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <ChevronRight className="w-5 h-5 mr-1 rotate-180" />
            Back to List
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Inspecting: {selectedItem.deviceType}
          </h1>
        </div>
        
        <DeviceInspection
          pickupId={selectedItem._id}
          onInspectionComplete={handleInspectionComplete}
          existingData={selectedItem.deviceConditionReport}
        />
      </div>
    );
  }

  // Render verification dashboard
  if (viewMode === 'verification' && selectedItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <ChevronRight className="w-5 h-5 mr-1 rotate-180" />
            Back to List
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Verification: {selectedItem.deviceType}
          </h1>
        </div>
        
        <VerificationDashboard
          pickupId={selectedItem._id}
          recyclerView={true}
        />
      </div>
    );
  }

  // Render main list view
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E-waste Inspection & Verification</h1>
              <p className="text-gray-600">
                Comprehensive device inspection with tamper-proof environmental impact tracking
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{ewasteItems.length}</p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {ewasteItems.filter(item => (item.inspectionStatus || '').toLowerCase() === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {ewasteItems.filter(item => (item.inspectionStatus || '').toLowerCase() === 'under inspection').length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {ewasteItems.filter(item => (item.inspectionStatus || '').toLowerCase() === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by device type, brand, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-400 mr-2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="Filter by status"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under inspection">Under Inspection</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-600">
              {ewasteItems.length === 0 
                ? 'No e-waste items assigned for inspection yet.'
                : 'No items match your current search and filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(item.inspectionStatus)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.inspectionStatus)}`}>
                        {item.inspectionStatus || 'Pending'}
                      </span>
                    </div>
                    {(item.inspectionStatus || '').toLowerCase() === 'completed' && (
                      <div title="Verified">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.deviceType || 'Unknown Device'}</h3>
                  
                  {(item.brand || item.model) && (
                    <p className="text-sm text-gray-600 mb-2">
                      {item.brand} {item.model}
                    </p>
                  )}
                  
                  {item.pickupAddress && (
                    <p className="text-sm text-gray-600 mb-2">📍 {item.pickupAddress}</p>
                  )}
                  
                  {item.scheduledDate && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(item.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  {item.estimatedValue > 0 && (
                    <p className="text-lg font-semibold text-green-600 mb-4">
                      ₹{item.estimatedValue}
                    </p>
                  )}
                  
                  <div className="flex space-x-2">
                    {(item.inspectionStatus || '').toLowerCase() !== 'completed' ? (
                      <button
                        onClick={() => handleInspectDevice(item)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {(item.inspectionStatus || '').toLowerCase() === 'under inspection' ? 'Continue Inspection' : 'Start Inspection'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewVerification(item)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        View Verification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EwasteInspection;