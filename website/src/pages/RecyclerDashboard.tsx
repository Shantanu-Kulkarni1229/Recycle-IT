import React, { useState, useEffect } from 'react';
import { pickupAPI, authAPI } from '../services/recyclerAPI';
import { getRecyclerData, formatDate, getStatusColor } from '../utils/helpers';

interface EwasteItem {
  _id: string;
  deviceType: string;
  brand: string;
  model: string;
  condition: string;
  pickupAddress: string;
  city: string;
  state: string;
  pincode: string;
  pickupStatus: string;
  preferredPickupDate: string;
  weight: number;
  notes: string;
  formattedAddress: string;
  userId: {
    name: string;
    phoneNumber: string;
    email: string;
  } | null;
}

const RecyclerDashboard: React.FC = () => {
  const [assignedEwaste, setAssignedEwaste] = useState<EwasteItem[]>([]);
  const [recyclerProfile, setRecyclerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get recycler profile
      const recyclerData = getRecyclerData();
      if (recyclerData) {
        setRecyclerProfile(recyclerData);
      }

      // Load available pending pickups (not yet assigned)
      try {
        console.log('Loading pending pickups...');
        const pendingResponse = await pickupAPI.getRecyclerPickups(''); // This calls unapproved-device endpoint
        console.log('Pending pickups response:', pendingResponse.data);
        
        if (pendingResponse.data.success) {
          const items = pendingResponse.data.pickups || [];
          console.log('Number of items received:', items.length);
          console.log('Items:', items);
          setAssignedEwaste(items);
          
          // Calculate stats
          const totalAssigned = items.length;
          const pending = items.filter((item: EwasteItem) => item.pickupStatus === 'Pending').length;
          const inProgress = items.filter((item: EwasteItem) => 
            ['Scheduled', 'In Transit', 'Collected'].includes(item.pickupStatus)
          ).length;
          const completed = items.filter((item: EwasteItem) => 
            ['Delivered', 'Verified'].includes(item.pickupStatus)
          ).length;
          
          console.log('Stats calculated:', { totalAssigned, pending, inProgress, completed });
          setStats({ totalAssigned, pending, inProgress, completed });
        } else {
          console.error('Failed to load pending pickups:', pendingResponse.data.message);
          setAssignedEwaste([]);
        }
      } catch (error) {
        console.error('Error loading pending pickups:', error);
        // Set mock data for demonstration
        setStats({ totalAssigned: 15, pending: 5, inProgress: 7, completed: 3 });
        setAssignedEwaste([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateInspectionStatus = async (pickupId: string, status: string) => {
    try {
      await pickupAPI.updateInspectionStatus({
        pickupId,
        inspectionStatus: status,
      });
      
      // Reload data
      loadDashboardData();
    } catch (error) {
      console.error('Error updating inspection status:', error);
    }
  };

  const handleAssignTestPickups = async () => {
    try {
      const response = await authAPI.assignTestPickups();
      if (response.data.success) {
        alert(`${response.data.count} pickups assigned! Refreshing dashboard...`);
        loadDashboardData(); // Reload data
      }
    } catch (error) {
      console.error('Error assigning test pickups:', error);
      alert('Failed to assign test pickups');
    }
  };

  const handleAcceptPickup = async (pickupId: string) => {
    try {
      // For now, just update the status to Scheduled
      const response = await pickupAPI.updatePickupStatus(pickupId, 'Scheduled');
      if (response.data.success) {
        alert('Pickup accepted successfully!');
        loadDashboardData(); // Reload data
      }
    } catch (error) {
      console.error('Error accepting pickup:', error);
      alert('Failed to accept pickup');
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-2xl`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Loading Dashboard...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {recyclerProfile?.companyName || 'Recycler'}!
        </h1>
        <p className="text-gray-600">Manage your e-waste pickup assignments and inspections.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Available Pickups"
          value={stats.totalAssigned}
          icon="📦"
          color="bg-blue-100"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon="⏳"
          color="bg-yellow-100"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon="🚛"
          color="bg-orange-100"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon="✅"
          color="bg-green-100"
        />
      </div>

      {/* Available Pickups */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Available E-waste Pickups</h3>
          <p className="text-sm text-gray-600">Devices available for pickup and recycling</p>
            <button
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                style={{ float: 'right', marginTop: '-8px' }}
                onClick={loadDashboardData}
                title="Refresh pickups"
              >
                Refresh
              </button>
        </div>
        
        <div className="p-6">
          {assignedEwaste.length > 0 ? (
            <div className="space-y-4">
              {assignedEwaste.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.brand} {item.model}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.deviceType} • Condition: {item.condition}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {item.formattedAddress || `${item.pickupAddress}, ${item.city}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        📅 Preferred: {formatDate(item.preferredPickupDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ⚖️ Weight: {item.weight}kg
                      </p>
                      {item.userId ? (
                        <p className="text-sm text-gray-500">
                          👤 Contact: {item.userId.name} ({item.userId.phoneNumber})
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          👤 Contact: No user information available
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.pickupStatus)}`}>
                        {item.pickupStatus}
                      </span>
                      
                      {item.pickupStatus === 'Pending' && (
                        <button
                          onClick={() => handleAcceptPickup(item._id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors mr-2"
                        >
                          Accept Pickup
                        </button>
                      )}
                      
                      {item.pickupStatus === 'Pending' && (
                        <button
                          onClick={() => updateInspectionStatus(item._id, 'Under Inspection')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Start Inspection
                        </button>
                      )}
                      
                      {item.pickupStatus === 'Collected' && (
                        <button
                          onClick={() => updateInspectionStatus(item._id, 'Completed')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                        >
                          Complete Inspection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned E-waste</h3>
              <p className="text-gray-600">No e-waste items have been assigned to you yet.</p>
              <button
                onClick={handleAssignTestPickups}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🧪 Assign Test Pickups (Development)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-3">
            <span className="text-xl">📝</span>
            <span>Create Inspection Report</span>
          </button>
          <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-3">
            <span className="text-xl">📋</span>
            <span>View Profile</span>
          </button>
          <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-3">
            <span className="text-xl">📊</span>
            <span>Upload Documents</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecyclerDashboard;
