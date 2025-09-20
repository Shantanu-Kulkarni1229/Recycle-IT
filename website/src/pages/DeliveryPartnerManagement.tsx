import React, { useState, useEffect, useCallback } from 'react';
import {
  deliveryPartnerAPI,
  DeliveryPartner,
  CreateDeliveryPartnerRequest
} from '../services/deliveryPartnerAPI';

const DeliveryPartnerManagement: React.FC = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    isAvailable: '',
    city: '',
    vehicleType: ''
  });

  const [newPartner, setNewPartner] = useState<CreateDeliveryPartnerRequest>({
    name: '',
    email: '',
    phoneNumber: '',
    alternateNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    serviceAreas: [{ city: '', pincode: '', isActive: true }],
    workingHours: [
      { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'Sunday', isWorking: false }
    ],
    baseSalary: 0,
    commissionPerDelivery: 0,
    emergencyContact: {
      name: '',
      phoneNumber: '',
      relationship: ''
    }
  });

  useEffect(() => {
    fetchPartners();
  }, [currentPage, filters]);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      // Convert isAvailable string to boolean for API
      const apiFilters = {
        ...filters,
        isAvailable: filters.isAvailable === '' ? undefined : filters.isAvailable === 'true'
      };
      const response = await deliveryPartnerAPI.getDeliveryPartners(currentPage, 10, apiFilters);
      setPartners(response.data.deliveryPartners);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      showAlert('Error fetching delivery partners', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    // Create beautiful alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white border-l-4 border-green-600' 
        : 'bg-red-500 text-white border-l-4 border-red-600'
    }`;
    
    alertDiv.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          ${type === 'success' 
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>'
            : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
          }
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <div class="ml-auto pl-3">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deliveryPartnerAPI.createDeliveryPartner(newPartner);
      showAlert('Delivery partner created successfully!');
      setShowCreateForm(false);
      fetchPartners();
      resetForm();
    } catch (error) {
      console.error('Error creating delivery partner:', error);
      showAlert('Error creating delivery partner', 'error');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery partner?')) {
      try {
        await deliveryPartnerAPI.deleteDeliveryPartner(id);
        showAlert('Delivery partner deleted successfully!');
        fetchPartners();
      } catch (error) {
        console.error('Error deleting delivery partner:', error);
        showAlert('Error deleting delivery partner', 'error');
      }
    }
  };

  const toggleAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      await deliveryPartnerAPI.updatePartnerAvailability(id, !currentAvailability);
      showAlert(`Partner availability ${!currentAvailability ? 'enabled' : 'disabled'} successfully!`);
      fetchPartners();
    } catch (error) {
      console.error('Error updating availability:', error);
      showAlert('Error updating availability', 'error');
    }
  };

  const resetForm = () => {
    setNewPartner({
      name: '',
      email: '',
      phoneNumber: '',
      alternateNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      vehicleType: 'Motorcycle',
      vehicleNumber: '',
      vehicleMake: '',
      vehicleModel: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      serviceAreas: [{ city: '', pincode: '', isActive: true }],
      workingHours: [
        { day: 'Monday', isWorking: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Sunday', isWorking: false }
      ],
      baseSalary: 0,
      commissionPerDelivery: 0,
      emergencyContact: {
        name: '',
        phoneNumber: '',
        relationship: ''
      }
    });
  };

  const addServiceArea = () => {
    setNewPartner(prev => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, { city: '', pincode: '', isActive: true }]
    }));
  };

  const removeServiceArea = (index: number) => {
    setNewPartner(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Suspended': 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Management</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add New Partner
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              value={filters.isAvailable}
              onChange={(e) => setFilters(prev => ({ ...prev, isAvailable: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Filter by availability"
            >
              <option value="">All Availability</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>

            <input
              type="text"
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Filter by vehicle type"
            >
              <option value="">All Vehicle Types</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Car">Car</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="E-Rickshaw">E-Rickshaw</option>
            </select>
          </div>
        </div>

        {/* Partners Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Areas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr key={partner._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                      <div className="text-sm text-gray-500">{partner.email}</div>
                      <div className="text-sm text-gray-500">{partner.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{partner.vehicleType}</div>
                      <div className="text-sm text-gray-500">{partner.vehicleNumber}</div>
                      {partner.vehicleMake && (
                        <div className="text-sm text-gray-500">{partner.vehicleMake} {partner.vehicleModel}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {partner.serviceAreas.map((area, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {area.city} - {area.pincode}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(partner.status)}`}>
                        {partner.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        partner.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {partner.isAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Deliveries: {partner.performanceMetrics.completedDeliveries}/{partner.performanceMetrics.totalDeliveries}</div>
                      <div>Success Rate: {partner.performanceMetrics.successRate.toFixed(1)}%</div>
                      <div>Rating: {partner.performanceMetrics.averageRating.toFixed(1)}/5</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleAvailability(partner._id, partner.isAvailable)}
                        className={`px-3 py-1 rounded text-xs ${
                          partner.isAvailable 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {partner.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => showAlert('Edit functionality coming soon!')}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Partner Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add New Delivery Partner</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close dialog"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={newPartner.name}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newPartner.email}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPartner.phoneNumber}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Number</label>
                  <input
                    type="tel"
                    value={newPartner.alternateNumber}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, alternateNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.address.street}
                      onChange={(e) => setNewPartner(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.address.city}
                      onChange={(e) => setNewPartner(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.address.state}
                      onChange={(e) => setNewPartner(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.address.pincode}
                      onChange={(e) => setNewPartner(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, pincode: e.target.value } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                    <select
                      required
                      value={newPartner.vehicleType}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Select vehicle type"
                    >
                      <option value="Bicycle">Bicycle</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="E-Rickshaw">E-Rickshaw</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.vehicleNumber}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Make</label>
                    <input
                      type="text"
                      value={newPartner.vehicleMake}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, vehicleMake: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                    <input
                      type="text"
                      value={newPartner.vehicleModel}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, vehicleModel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.licenseNumber}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={newPartner.licenseExpiryDate}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Service Areas</h3>
                  <button
                    type="button"
                    onClick={addServiceArea}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    Add Area
                  </button>
                </div>
                {newPartner.serviceAreas.map((area, index) => (
                  <div key={index} className="flex gap-4 mb-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={area.city}
                      onChange={(e) => {
                        const updatedAreas = [...newPartner.serviceAreas];
                        updatedAreas[index].city = e.target.value;
                        setNewPartner(prev => ({ ...prev, serviceAreas: updatedAreas }));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={area.pincode}
                      onChange={(e) => {
                        const updatedAreas = [...newPartner.serviceAreas];
                        updatedAreas[index].pincode = e.target.value;
                        setNewPartner(prev => ({ ...prev, serviceAreas: updatedAreas }));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {newPartner.serviceAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceArea(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newPartner.emergencyContact?.name || ''}
                      onChange={(e) => setNewPartner(prev => ({ 
                        ...prev, 
                        emergencyContact: { 
                          ...prev.emergencyContact, 
                          name: e.target.value,
                          phoneNumber: prev.emergencyContact?.phoneNumber || '',
                          relationship: prev.emergencyContact?.relationship || ''
                        } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={newPartner.emergencyContact?.phoneNumber || ''}
                      onChange={(e) => setNewPartner(prev => ({ 
                        ...prev, 
                        emergencyContact: { 
                          ...prev.emergencyContact, 
                          phoneNumber: e.target.value,
                          name: prev.emergencyContact?.name || '',
                          relationship: prev.emergencyContact?.relationship || ''
                        } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={newPartner.emergencyContact?.relationship || ''}
                      onChange={(e) => setNewPartner(prev => ({ 
                        ...prev, 
                        emergencyContact: { 
                          ...prev.emergencyContact, 
                          relationship: e.target.value,
                          name: prev.emergencyContact?.name || '',
                          phoneNumber: prev.emergencyContact?.phoneNumber || ''
                        } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Compensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPartner.baseSalary}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, baseSalary: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission per Delivery (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPartner.commissionPerDelivery}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, commissionPerDelivery: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerManagement;