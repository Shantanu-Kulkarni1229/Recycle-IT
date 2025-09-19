import React, { useState, useEffect } from 'react';
import { pickupAPI } from '../services/completeAPI';
import { deliveryPartnerAPI, DeliveryPartner } from '../services/deliveryPartnerAPI';

interface Pickup {
  _id: string;
  deviceType: string;
  brand: string;
  model: string;
  condition: string;
  pickupStatus: string;
  pickupAddress: string;
  city: string;
  state: string;
  pincode: string;
  preferredPickupDate: string;
  createdAt: string;
  notes?: string;
  weight?: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  assignedRecyclerId?: {
    _id: string;
    ownerName: string;
    companyName: string;
    email: string;
    phoneNumber: string;
  };
  assignedDeliveryPartnerId?: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    vehicleType: string;
    vehicleNumber: string;
    isAvailable: boolean;
  };
}

const PickupManagement: React.FC = () => {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Delivery Partner Assignment State
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [availablePartners, setAvailablePartners] = useState<DeliveryPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [partnerAssignmentPickup, setPartnerAssignmentPickup] = useState<Pickup | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPickups, setTotalPickups] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadAllPickups();
  }, [currentPage, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllPickups = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        ...(filterStatus !== 'all' && { status: filterStatus })
      };
      
      const response = await pickupAPI.getAllPickups(params);
      
      if (response.success) {
        setPickups(response.data.pickups || []);
        setTotalPages(response.data.pagination.totalPages);
        setTotalPickups(response.data.pagination.totalPickups);
      } else {
        setError('Failed to load pickups');
        setPickups([]);
      }
    } catch (err: any) {
      console.error('Error loading pickups:', err);
      setError('Failed to load pickups from server');
      setPickups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (pickupId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      
      await pickupAPI.updatePickupStatus(pickupId, newStatus);
      await loadAllPickups(); // Reload data
      
      // Show success message based on status
      let successMessage = '';
      switch (newStatus) {
        case 'Scheduled':
          successMessage = '🎉 Pickup approved and scheduled! User has been notified via email.';
          break;
        case 'In Transit':
          successMessage = '🚚 Pickup marked as in transit! User has been notified that team is on the way.';
          break;
        case 'Collected':
          successMessage = '📦 Device collection confirmed! User has been thanked for recycling.';
          break;
        case 'Delivered':
          successMessage = '✅ Delivery to facility confirmed! User has been updated.';
          break;
        case 'Verified':
          successMessage = '🔍 Device verification complete! User has been notified.';
          break;
        case 'Cancelled':
          successMessage = '❌ Pickup cancelled. User has been notified and support information provided.';
          break;
        default:
          successMessage = `✅ Status updated to ${newStatus}! User notification sent.`;
      }
      
      alert(successMessage);
      setSelectedPickup(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delivery Partner Assignment Functions
  const openPartnerAssignment = async (pickup: Pickup) => {
    try {
      setPartnerAssignmentPickup(pickup);
      setSelectedPartnerId('');
      
      // Get available partners for this pickup location
      const response = await deliveryPartnerAPI.getAvailablePartners({
        city: pickup.city,
        pincode: pickup.pincode
      });
      
      if (response.success) {
        setAvailablePartners(response.data.deliveryPartners);
      } else {
        setAvailablePartners([]);
      }
      
      setShowPartnerModal(true);
    } catch (error) {
      console.error('Error fetching available partners:', error);
      alert('❌ Failed to load available delivery partners');
    }
  };

  const assignDeliveryPartner = async () => {
    if (!partnerAssignmentPickup || !selectedPartnerId) {
      alert('⚠️ Please select a delivery partner');
      return;
    }

    try {
      setIsUpdating(true);
      
      await pickupAPI.assignDeliveryPartner(partnerAssignmentPickup._id, selectedPartnerId);
      
      // Reload data to show updated assignment
      await loadAllPickups();
      
      // Close modal and reset state
      setShowPartnerModal(false);
      setPartnerAssignmentPickup(null);
      setSelectedPartnerId('');
      setAvailablePartners([]);
      
      alert('🚚 Delivery partner assigned successfully!');
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      alert('❌ Failed to assign delivery partner. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'collected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'verified':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPickups = filterStatus === 'all' 
    ? pickups 
    : pickups.filter(pickup => pickup.pickupStatus === filterStatus);

  const getStatusStats = () => {
    return {
      pending: pickups.filter(p => p.pickupStatus === 'Pending').length,
      scheduled: pickups.filter(p => p.pickupStatus === 'Scheduled').length,
      inTransit: pickups.filter(p => p.pickupStatus === 'In Transit').length,
      collected: pickups.filter(p => p.pickupStatus === 'Collected').length,
      total: pickups.length
    };
  };

  const stats = getStatusStats();

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
            <p className="text-gray-600">Manage all scheduled e-waste pickups</p>
          </div>
          
          <button
            onClick={loadAllPickups}
            disabled={isLoading}
            className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pickups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.collected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Transit">In Transit</option>
              <option value="Collected">Collected</option>
              <option value="Delivered">Delivered</option>
              <option value="Verified">Verified</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="flex-shrink-0 h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pickups Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Pickups ({filteredPickups.length})
          </h2>
        </div>

        {filteredPickups.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No pickups found</h3>
            <p className="text-gray-500">There are no pickups matching your current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPickups.map((pickup) => (
                  <tr key={pickup._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {pickup.deviceType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pickup.brand} {pickup.model}
                        </div>
                        <div className="text-xs text-gray-400">
                          Condition: {pickup.condition}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {pickup.userId ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {pickup.userId.firstName} {pickup.userId.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pickup.userId.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pickup.userId.phoneNumber}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">User not available</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {pickup.pickupAddress}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pickup.city}, {pickup.state} {pickup.pincode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.pickupStatus)}`}>
                        {pickup.pickupStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pickup.assignedDeliveryPartnerId ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {pickup.assignedDeliveryPartnerId.name}
                          </div>
                          <div className="text-gray-500">
                            {pickup.assignedDeliveryPartnerId.vehicleType} - {pickup.assignedDeliveryPartnerId.vehicleNumber}
                          </div>
                          <div className="text-xs text-gray-400">
                            {pickup.assignedDeliveryPartnerId.phoneNumber}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <button
                            onClick={() => openPartnerAssignment(pickup)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Assign Partner
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Created: {formatDate(pickup.createdAt)}</div>
                      <div>Preferred: {formatDate(pickup.preferredPickupDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPickup(pickup)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View
                        </button>
                        {pickup.pickupStatus === 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(pickup._id, 'Scheduled')}
                            disabled={isUpdating}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span> ({totalPickups} total)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pickup Details Modal */}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Pickup Details
                </h2>
                <button
                  onClick={() => setSelectedPickup(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device Type</label>
                    <p className="text-sm text-gray-900">{selectedPickup.deviceType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand & Model</label>
                    <p className="text-sm text-gray-900">{selectedPickup.brand} {selectedPickup.model}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Condition</label>
                    <p className="text-sm text-gray-900">{selectedPickup.condition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPickup.pickupStatus)}`}>
                      {selectedPickup.pickupStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Address</label>
                  <p className="text-sm text-gray-900">
                    {selectedPickup.pickupAddress}<br />
                    {selectedPickup.city}, {selectedPickup.state} {selectedPickup.pincode}
                  </p>
                </div>

                {selectedPickup.userId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Details</label>
                    <p className="text-sm text-gray-900">
                      {selectedPickup.userId.firstName} {selectedPickup.userId.lastName}<br />
                      {selectedPickup.userId.email}<br />
                      {selectedPickup.userId.phoneNumber}
                    </p>
                  </div>
                )}

                {selectedPickup.assignedRecyclerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Recycler</label>
                    <p className="text-sm text-gray-900">
                      {selectedPickup.assignedRecyclerId.ownerName}<br />
                      {selectedPickup.assignedRecyclerId.companyName}<br />
                      {selectedPickup.assignedRecyclerId.email}<br />
                      {selectedPickup.assignedRecyclerId.phoneNumber}
                    </p>
                  </div>
                )}

                {selectedPickup.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedPickup.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedPickup.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Pickup Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedPickup.preferredPickupDate)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  {selectedPickup.pickupStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedPickup._id, 'Scheduled')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve Pickup
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedPickup._id, 'Cancelled')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject Pickup
                      </button>
                    </>
                  )}
                  
                  {selectedPickup.pickupStatus === 'Scheduled' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedPickup._id, 'In Transit')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark In Transit
                    </button>
                  )}
                  
                  {selectedPickup.pickupStatus === 'In Transit' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedPickup._id, 'Collected')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Mark Collected
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Partner Assignment Modal */}
      {showPartnerModal && partnerAssignmentPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign Delivery Partner
                </h2>
                <button
                  onClick={() => setShowPartnerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pickup Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Device:</span> {partnerAssignmentPickup.deviceType}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {partnerAssignmentPickup.city}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span> {partnerAssignmentPickup.pickupAddress}
                    </div>
                    <div>
                      <span className="font-medium">Pincode:</span> {partnerAssignmentPickup.pincode}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Available Delivery Partners</h3>
                {availablePartners.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8a2 2 0 00-2-2H6a2 2 0 00-2 2m7 16V4" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No delivery partners available for this area</p>
                    <p className="text-sm text-gray-400 mt-1">Please add delivery partners for {partnerAssignmentPickup.city} - {partnerAssignmentPickup.pincode}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availablePartners.map((partner) => (
                      <div key={partner._id} className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="deliveryPartner"
                            value={partner._id}
                            checked={selectedPartnerId === partner._id}
                            onChange={(e) => setSelectedPartnerId(e.target.value)}
                            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">{partner.name}</h4>
                                <p className="text-sm text-gray-600">{partner.email}</p>
                                <p className="text-sm text-gray-600">{partner.phoneNumber}</p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  partner.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {partner.isAvailable ? 'Available' : 'Not Available'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">Vehicle:</span> {partner.vehicleType} - {partner.vehicleNumber}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Performance:</span> {partner.performanceMetrics.successRate.toFixed(1)}% success rate, 
                              {partner.performanceMetrics.averageRating.toFixed(1)}/5 rating
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowPartnerModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                {availablePartners.length > 0 && (
                  <button
                    onClick={assignDeliveryPartner}
                    disabled={!selectedPartnerId || isUpdating}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Assigning...' : 'Assign Partner'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupManagement;