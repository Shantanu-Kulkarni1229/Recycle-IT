import React, { useState, useEffect } from 'react';
import { ewasteAPI, recyclerPickupAPI } from '../services/completeAPI';

interface EwasteItem {
  _id: string;
  deviceType: string;
  condition: string;
  estimatedValue: number;
  inspectionStatus: string;
  inspectionNotes?: string;
  inspectionDate?: string;
  photos?: string[];
  pickupId?: string;
  userDetails?: any;
  brand?: string;
  model?: string;
}

const EwasteInspection: React.FC = () => {
  const [ewasteItems, setEwasteItems] = useState<EwasteItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EwasteItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInspecting, setIsInspecting] = useState(false);
  const [error, setError] = useState('');
  const [inspectionData, setInspectionData] = useState({
    condition: '',
    estimatedValue: '',
    notes: '',
    status: 'pending'
  });

  useEffect(() => {
    const loadEwasteItems = async () => {
      try {
        setIsLoading(true);
        const response = await ewasteAPI.getAssignedEwaste();
        
        if (response.success) {
          setEwasteItems(response.data || []);
        } else {
          setEwasteItems([]);
        }
      } catch (error) {
        console.error('Error loading e-waste items:', error);
        setEwasteItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEwasteItems();
  }, []);

  const loadEwasteItemsRefresh = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await ewasteAPI.getAssignedEwaste();
      if (response.success && response.ewaste) {
        setEwasteItems(response.ewaste);
      } else {
        setEwasteItems([]);
      }
    } catch (err: any) {
      console.error('E-waste loading error:', err);
      setError('Failed to load e-waste items.');
      setEwasteItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectionSubmit = async () => {
    if (!selectedItem) return;
    
    try {
      setIsInspecting(true);
      setError('');
      
      const inspectionPayload = {
        condition: inspectionData.condition,
        estimatedValue: parseFloat(inspectionData.estimatedValue),
        notes: inspectionData.notes,
        inspectionDate: new Date().toISOString()
      };
      
      // Update via recycler pickup API
      await recyclerPickupAPI.inspectDevice(selectedItem._id, inspectionPayload);
      
      // Update e-waste inspection status
      await ewasteAPI.updateInspectionStatus(
        selectedItem._id, 
        'completed', 
        inspectionData.notes
      );
      
      // Update local state
      setEwasteItems(prev => prev.map(item => 
        item._id === selectedItem._id 
          ? { 
              ...item, 
              condition: inspectionData.condition,
              estimatedValue: parseFloat(inspectionData.estimatedValue),
              inspectionStatus: 'completed',
              inspectionNotes: inspectionData.notes,
              inspectionDate: new Date().toISOString()
            }
          : item
      ));
      
      setSelectedItem(null);
      setInspectionData({ condition: '', estimatedValue: '', notes: '', status: 'pending' });
      
    } catch (err: any) {
      setError('Failed to submit inspection');
    } finally {
      setIsInspecting(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingItems = ewasteItems.filter(item => item.inspectionStatus === 'pending');
  const completedItems = ewasteItems.filter(item => item.inspectionStatus === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading e-waste items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800">E-waste Inspection</h1>
        <p className="text-gray-600">Inspect and evaluate electronic devices</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{ewasteItems.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
          <div className="text-sm text-gray-600">Pending Inspection</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            ₹{completedItems.reduce((sum, item) => sum + item.estimatedValue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Pending Inspections */}
      {pendingItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Pending Inspections ({pendingItems.length})
            </h2>
          </div>
          <div className="divide-y">
            {pendingItems.map((item) => (
              <div key={item._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{item.deviceType}</h3>
                    <p className="text-sm text-gray-600">
                      Pickup ID: {item.pickupId || 'N/A'}
                    </p>
                    {item.userDetails && (
                      <p className="text-sm text-gray-600">
                        Customer: {item.userDetails.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.inspectionStatus)}`}>
                      {item.inspectionStatus.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Start Inspection
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Inspections */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Completed Inspections ({completedItems.length})
          </h2>
        </div>
        {completedItems.length > 0 ? (
          <div className="divide-y">
            {completedItems.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.deviceType}</h3>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                      <span className="text-gray-600">
                        Value: ₹{item.estimatedValue.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        {item.inspectionDate && new Date(item.inspectionDate).toLocaleDateString()}
                      </span>
                    </div>
                    {item.inspectionNotes && (
                      <p className="mt-2 text-sm text-gray-600">
                        Notes: {item.inspectionNotes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No completed inspections</h3>
            <p className="text-gray-600">Completed inspections will appear here</p>
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedItem.inspectionStatus === 'completed' ? 'Inspection Details' : 'Device Inspection'}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Device Type</label>
                  <p className="text-gray-800">{selectedItem.deviceType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup ID</label>
                  <p className="text-gray-800">{selectedItem.pickupId || 'N/A'}</p>
                </div>

                {selectedItem.userDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-gray-800">
                      {selectedItem.userDetails.name} • {selectedItem.userDetails.phone}
                    </p>
                  </div>
                )}

                {selectedItem.inspectionStatus === 'pending' ? (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-800">Inspection Details</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Device Condition
                      </label>
                      <select
                        aria-label="Device Condition"
                        value={inspectionData.condition}
                        onChange={(e) => setInspectionData(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select condition</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Value (₹)
                      </label>
                      <input
                        type="number"
                        value={inspectionData.estimatedValue}
                        onChange={(e) => setInspectionData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter estimated value"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inspection Notes
                      </label>
                      <textarea
                        value={inspectionData.notes}
                        onChange={(e) => setInspectionData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter detailed inspection notes..."
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleInspectionSubmit}
                        disabled={isInspecting || !inspectionData.condition || !inspectionData.estimatedValue}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isInspecting ? 'Submitting...' : 'Complete Inspection'}
                      </button>
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-800">Inspection Results</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedItem.condition)}`}>
                          {selectedItem.condition}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Value</label>
                        <p className="text-gray-800 font-semibold">₹{selectedItem.estimatedValue.toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedItem.inspectionNotes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="text-gray-800">{selectedItem.inspectionNotes}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Inspection Date</label>
                      <p className="text-gray-800">
                        {selectedItem.inspectionDate && new Date(selectedItem.inspectionDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EwasteInspection;
