import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  LogOut,
  Settings,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { adminApiService } from '../services/adminApi';
import { testimonialAPI } from '../services/testimonialAPI';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recyclers' | 'transactions' | 'testimonials'>('overview');
  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    // Get admin data
    const adminInfo = localStorage.getItem('adminData');
    if (adminInfo) {
      setAdminData(JSON.parse(adminInfo));
    }

    // Load initial data
    loadRecyclers();
    loadTransactions();
    loadTestimonials();
  }, []);

  const loadRecyclers = async () => {
    setLoading(true);
    try {
      const response = await adminApiService.getAllRecyclers();
      if (response.data.success) {
        setRecyclers(response.data.data);
      } else {
        console.error('Failed to load recyclers:', response.data.message);
        // Fallback to mock data if API fails
        setRecyclers([
          {
            id: 1,
            ownerName: 'John Doe',
            companyName: 'EcoRecycle Ltd',
            email: 'john@ecorecycle.com',
            phoneNumber: '9876543210',
            city: 'Mumbai',
            state: 'Maharashtra',
            isVerified: true,
            registrationDate: '2024-01-15',
            totalTransactions: 25,
            totalAmount: 150000
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading recyclers:', error);
      // Fallback to mock data
      setRecyclers([
        {
          id: 1,
          ownerName: 'John Doe',
          companyName: 'EcoRecycle Ltd',
          email: 'john@ecorecycle.com',
          phoneNumber: '9876543210',
          city: 'Mumbai',
          state: 'Maharashtra',
          isVerified: true,
          registrationDate: '2024-01-15',
          totalTransactions: 25,
          totalAmount: 150000
        },
        {
          id: 2,
          ownerName: 'Jane Smith',
          companyName: 'Green Solutions',
          email: 'jane@greensolutions.com',
          phoneNumber: '8765432109',
          city: 'Delhi',
          state: 'Delhi',
          isVerified: true,
          registrationDate: '2024-02-20',
          totalTransactions: 18,
          totalAmount: 95000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await adminApiService.getAllTransactions();
      if (response.data.success) {
        setTransactions(response.data.data);
      } else {
        console.error('Failed to load transactions:', response.data.message);
        // Fallback to mock data
        setTransactions([
          {
            id: 1,
            recyclerId: 1,
            recyclerName: 'John Doe',
            companyName: 'EcoRecycle Ltd',
            type: 'E-waste Collection',
            amount: 15000,
            date: '2024-12-15',
            status: 'Completed',
            description: 'Computer parts and electronics'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Fallback to mock data
      setTransactions([
        {
          id: 1,
          recyclerId: 1,
          recyclerName: 'John Doe',
          companyName: 'EcoRecycle Ltd',
          type: 'E-waste Collection',
          amount: 15000,
          date: '2024-12-15',
          status: 'Completed',
          description: 'Computer parts and electronics'
        },
        {
          id: 2,
          recyclerId: 2,
          recyclerName: 'Jane Smith',
          companyName: 'Green Solutions',
          type: 'Plastic Recycling',
          amount: 8500,
          date: '2024-12-14',
          status: 'Processing',
          description: 'PET bottles and containers'
        }
      ]);
    }
  };

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const response = await testimonialAPI.getAllTestimonials();
      setTestimonials(response.testimonials || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // Fallback to empty array
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecyclers = recyclers.filter(recycler =>
    recycler.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recycler.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recycler.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction =>
    transaction.recyclerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRecyclers = recyclers.length;
  const verifiedRecyclers = recyclers.filter(r => r.isVerified).length;
  const totalTransactionsAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = transactions.filter(t => t.status === 'Completed').length;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Recyclers</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecyclers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verified Recyclers</p>
              <p className="text-2xl font-bold text-gray-900">{verifiedRecyclers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalTransactionsAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{completedTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{transaction.recyclerName}</p>
                  <p className="text-sm text-gray-500">{transaction.type} - {transaction.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{transaction.amount.toLocaleString()}</p>
                  <p className={`text-sm px-2 py-1 rounded-full inline-block ${
                    transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecyclers = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search recyclers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Recyclers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recycler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecyclers.map((recycler) => (
                <tr key={recycler.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{recycler.ownerName}</div>
                      <div className="text-sm text-gray-500">{recycler.email}</div>
                      <div className="text-sm text-gray-500">{recycler.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{recycler.companyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{recycler.city}</div>
                    <div className="text-sm text-gray-500">{recycler.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      recycler.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {recycler.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recycler.totalTransactions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{recycler.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(recycler.registrationDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recycler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id.toString().padStart(6, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.recyclerName}</div>
                      <div className="text-sm text-gray-500">{transaction.companyName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTestimonials = () => {
    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ));
    };

    const averageRating = testimonials.length > 0 
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
      : 0;

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Testimonials</p>
                <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">5-Star Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{testimonials.filter(t => t.rating === 5).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Testimonials</h3>
            {testimonials.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No testimonials</h3>
                <p className="mt-1 text-sm text-gray-500">No customer feedback has been received yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recycler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testimonials.map((testimonial: any) => (
                      <tr key={testimonial._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {testimonial.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{testimonial.userId?.name || 'Unknown User'}</div>
                              <div className="text-sm text-gray-500">{testimonial.userId?.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {testimonial.recyclerId?.companyName || testimonial.recyclerId?.ownerName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">{testimonial.recyclerId?.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {renderStars(testimonial.rating)}
                            <span className="ml-2 text-sm text-gray-600">({testimonial.rating})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{testimonial.feedback}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(testimonial.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {adminData?.username}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Notifications">
                <Bell className="h-6 w-6" />
              </button>
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600" title="Settings">
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="h-5 w-5 inline-block mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('recyclers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recyclers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 inline-block mr-2" />
              Recyclers
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-5 w-5 inline-block mr-2" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testimonials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="h-5 w-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
              </svg>
              Testimonials
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'recyclers' && renderRecyclers()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'testimonials' && renderTestimonials()}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
