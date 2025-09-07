import React, { useState, useEffect } from 'react';
import { recyclerPickupAPI, ewasteAPI } from '../services/completeAPI';
import { getRecyclerData, formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { DashboardStats, SchedulePickup, RecyclerPickup } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    pendingPickups: 0,
    completedToday: 0,
    inProgress: 0,
    monthlyRevenue: 0,
    totalPickups: 0,
    averageRating: 0,
  });
  const [recentPickups, setRecentPickups] = useState<SchedulePickup[]>([]);
  const [pendingInspections, setPendingInspections] = useState<RecyclerPickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const recyclerData = getRecyclerData();
      if (!recyclerData) return;

      setIsLoading(true);

      // Load dashboard stats (mock data for demonstration)
      const mockStats: DashboardStats = {
        pendingPickups: 12,
        completedToday: 5,
        inProgress: 8,
        monthlyRevenue: 45000,
        totalPickups: 156,
        averageRating: 4.8,
      };
      setStats(mockStats);

      // Load recent pickups assigned to this recycler
      try {
        const pickupsResponse = await recyclerPickupAPI.getRecyclerPickups(recyclerData._id);
        if (pickupsResponse.data.success) {
          setRecentPickups(pickupsResponse.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading pickups:', error);
        setRecentPickups([]);
      }

      // Load pending inspections
      try {
        const inspectionsResponse = await ewasteAPI.getAssignedEwaste();
        if (inspectionsResponse.data.success) {
          const pending = inspectionsResponse.data.data.filter(
            (inspection: RecyclerPickup) => inspection.inspectionStatus === 'Pending'
          );
          setPendingInspections(pending.slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading inspections:', error);
        setPendingInspections([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, bgColor, iconBg, textColor }: { 
    title: string; 
    value: string | number; 
    icon: string; 
    bgColor: string;
    iconBg: string;
    textColor: string;
  }) => (
    <div className={`${bgColor} p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-black ${textColor} mb-1`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            <p className="text-gray-500">Loading recycling data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
            <p className="text-gray-600">Here's what's happening with your recycling operations today.</p>
          </div>
          <div className="hidden lg:block">
            <div className="bg-emerald-50 rounded-2xl p-4">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm font-medium text-emerald-700">Keep up the great work!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Pickups"
          value={stats.pendingPickups}
          icon="📦"
          bgColor="bg-blue-50"
          iconBg="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon="✅"
          bgColor="bg-emerald-50"
          iconBg="bg-emerald-100"
          textColor="text-emerald-600"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon="🔄"
          bgColor="bg-yellow-50"
          iconBg="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon="💰"
          bgColor="bg-purple-50"
          iconBg="bg-purple-100"
          textColor="text-purple-600"
        />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pickup Requests */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Pickup Requests</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentPickups.length > 0 ? (
              recentPickups.map((pickup) => (
                <div key={pickup._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <span className="text-sm">📱</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {pickup.brand} {pickup.model}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {pickup.deviceType} • {pickup.city}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Preferred: {formatDate(pickup.preferredPickupDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.pickupStatus)}`}>
                      {pickup.pickupStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-medium">No recent pickup requests</p>
                <p className="text-sm text-gray-400">New requests will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Inspections */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Pending Inspections</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {pendingInspections.length > 0 ? (
              pendingInspections.map((inspection) => (
                <div key={inspection._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-sm">🔍</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Inspection #{inspection._id.slice(-6)}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        Created: {formatDate(inspection.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.inspectionStatus)}`}>
                      {inspection.inspectionStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-medium">No pending inspections</p>
                <p className="text-sm text-gray-400">Completed items will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-emerald-600 text-white p-6 rounded-xl hover:bg-emerald-700 transition-all duration-200 flex items-center space-x-4 transform hover:-translate-y-1 hover:shadow-lg">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div className="text-left">
              <p className="font-semibold">Create Report</p>
              <p className="text-emerald-100 text-sm">New inspection report</p>
            </div>
          </button>
          
          <button className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-4 transform hover:-translate-y-1 hover:shadow-lg">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-left">
              <p className="font-semibold">View Analytics</p>
              <p className="text-blue-100 text-sm">Performance insights</p>
            </div>
          </button>
          
          <button className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center space-x-4 transform hover:-translate-y-1 hover:shadow-lg">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-left">
              <p className="font-semibold">Manage Payments</p>
              <p className="text-purple-100 text-sm">Process transactions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
