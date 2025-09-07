import React, { useState, useEffect } from 'react';
import { recyclerPickupAPI, pickupAPI } from '../services/completeAPI';

interface Pickup {
  _id: string;
  pickupId?: string;
  deviceType: string;
  status: string;
  createdAt: string;
  scheduledDate?: string;
  userDetails?: any;
  address?: string;
  inspectionStatus?: string;
  paymentStatus?: string;
}

const PickupManagement: React.FC = () => {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const recyclerData = JSON.parse(localStorage.getItem('recyclerData') || '{}');

  useEffect(() => {
    const loadPickups = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await recyclerPickupAPI.getRecyclerPickups(recyclerData._id);
        
        if (response.success) {
          setPickups(response.data || []);
        } else {
          setError('Failed to load pickups');
        }
      } catch (err: any) {
        console.error('Error loading pickups:', err);
        setError('Failed to load pickups. Using sample data.');
        // Set sample data as fallback
        setPickups([
          {
            _id: '1',
            pickupId: 'PU001',
            deviceType: 'Laptop',
            status: 'assigned',
            createdAt: new Date().toISOString(),
            scheduledDate: new Date().toISOString(),
            userDetails: { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
            address: '123 Main St, City, State 12345',
            inspectionStatus: 'pending',
            paymentStatus: 'pending'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPickups();
  }, [recyclerData._id]);

  const loadPickupsRefresh = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Try to load recycler-specific pickups
      if (recyclerData._id) {
        const response = await recyclerPickupAPI.getRecyclerPickups(recyclerData._id);
        if (response.success && response.pickups) {
          setPickups(response.pickups);
        } else {
          // Fallback to mock data for demonstration
          setPickups(generateMockPickups());
        }
      } else {
        setPickups(generateMockPickups());
      }
    } catch (err: any) {
      console.error('Pickup loading error:', err);
      setError('Failed to load pickups. Showing sample data.');
      setPickups(generateMockPickups());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockPickups = (): Pickup[] => {
    return [
      {
        _id: '1',
        pickupId: 'PKP001',
        deviceType: 'Smartphone',
        status: 'received',
        createdAt: new Date().toISOString(),
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        address: '123 Tech Street, Mumbai',
        inspectionStatus: 'pending',
        paymentStatus: 'pending',
        userDetails: { name: 'John Doe', phone: '9876543210' }
      },
      {
        _id: '2',
        pickupId: 'PKP002',
        deviceType: 'Laptop',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        scheduledDate: new Date().toISOString(),
        address: '456 Green Avenue, Delhi',
        inspectionStatus: 'completed',
        paymentStatus: 'proposed',
        userDetails: { name: 'Jane Smith', phone: '9876543211' }
      },
      {
        _id: '3',
        pickupId: 'PKP003',
        deviceType: 'Tablet',
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        scheduledDate: new Date(Date.now() - 86400000).toISOString(),
        address: '789 Eco Lane, Bangalore',
        inspectionStatus: 'completed',
        paymentStatus: 'completed',
        userDetails: { name: 'Mike Wilson', phone: '9876543212' }
      }
    ];
  };

  const handleStatusUpdate = async (pickupId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      
      // Update the status via API
      await recyclerPickupAPI.updateInspectionStatus(pickupId, newStatus);
      
      // Update local state
      setPickups(prev => prev.map(pickup => 
        pickup._id === pickupId 
          ? { ...pickup, inspectionStatus: newStatus }
          : pickup
      ));
      
      setSelectedPickup(null);
    } catch (err: any) {
      setError('Failed to update pickup status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmReceived = async (pickupId: string) => {
    try {
      setIsUpdating(true);
      await recyclerPickupAPI.confirmReceived(pickupId);
      
      setPickups(prev => prev.map(pickup => 
        pickup._id === pickupId 
          ? { ...pickup, status: 'received' }
          : pickup
      ));
    } catch (err: any) {
      setError('Failed to confirm pickup receipt');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPickups = filterStatus === 'all' 
    ? pickups 
    : pickups.filter(pickup => pickup.status === filterStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pickups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pickup Management</h1>
            <p className="text-gray-600">Manage e-waste pickups and inspections</p>
          </div>
          
          {/* Filter */}
          <div className="mt-4 md:mt-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Pickups</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{pickups.length}</div>
          <div className="text-sm text-gray-600">Total Pickups</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {pickups.filter(p => p.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {pickups.filter(p => p.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {pickups.filter(p => p.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Pickups List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Pickup List ({filteredPickups.length})
          </h2>
        </div>
        
        {filteredPickups.length > 0 ? (
          <div className="divide-y">
            {filteredPickups.map((pickup) => (
              <div key={pickup._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {pickup.pickupId || `PKP-${pickup._id.slice(-6)}`}
                        </h3>
                        <p className="text-sm text-gray-600">{pickup.deviceType}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>
                          {pickup.status.replace('_', ' ').toUpperCase()}
                        </span>
                        
                        {pickup.inspectionStatus && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.inspectionStatus)}`}>
                            Inspection: {pickup.inspectionStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <p>📍 {pickup.address}</p>
                      <p>📅 {new Date(pickup.createdAt).toLocaleDateString()}</p>
                      {pickup.userDetails && (
                        <p>👤 {pickup.userDetails.name} • {pickup.userDetails.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {pickup.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmReceived(pickup._id)}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        Confirm Received
                      </button>
                    )}
                    
                    {pickup.status === 'received' && pickup.inspectionStatus === 'pending' && (
                      <button
                        onClick={() => setSelectedPickup(pickup)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Start Inspection
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedPickup(pickup)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No pickups found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'No pickups have been assigned to you yet.' 
                : `No ${filterStatus} pickups found.`}
            </p>
          </div>
        )}
      </div>

      {/* Pickup Detail Modal */}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Pickup Details - {selectedPickup.pickupId || selectedPickup._id.slice(-6)}
                </h3>
                <button
                  onClick={() => setSelectedPickup(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Device Type</label>
                  <p className="text-gray-800">{selectedPickup.deviceType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPickup.status)}`}>
                    {selectedPickup.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="text-gray-800">{selectedPickup.address}</p>
              </div>
              
              {selectedPickup.userDetails && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Details</label>
                  <p className="text-gray-800">
                    {selectedPickup.userDetails.name} • {selectedPickup.userDetails.phone}
                  </p>
                </div>
              )}
              
              {selectedPickup.status === 'received' && selectedPickup.inspectionStatus === 'pending' && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-800 mb-3">Update Inspection Status</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedPickup._id, 'in_progress')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Start Inspection
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedPickup._id, 'completed')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupManagement;
