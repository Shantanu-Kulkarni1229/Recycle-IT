import React, { useState, useEffect } from 'react';
import { recyclerPickupAPI } from '../services/completeAPI';

interface Payment {
  _id: string;
  pickupId: string;
  deviceType: string;
  proposedAmount: number;
  finalAmount?: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  userDetails?: any;
  inspectionNotes?: string;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [proposalData, setProposalData] = useState({
    amount: '',
    notes: ''
  });

  const recyclerData = JSON.parse(localStorage.getItem('recyclerData') || '{}');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        // For now, load sample data since we need to implement the actual API
        setPayments([
          {
            _id: '1',
            pickupId: 'PU001',
            deviceType: 'Laptop',
            proposedAmount: 12000,
            status: 'pending',
            userDetails: { name: 'John Doe', phone: '123-456-7890' },
            createdAt: new Date().toISOString(),
            inspectionNotes: 'Good condition, minor scratches'
          }
        ]);
      } catch (error) {
        console.error('Error loading payments:', error);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);

  const loadPaymentsRefresh = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (recyclerData._id) {
        const response = await recyclerPickupAPI.getRecyclerPickups(recyclerData._id);
        if (response.success && response.pickups) {
          // Filter only pickups that have inspection completed
          const paymentsData = response.pickups
            .filter((pickup: any) => pickup.inspectionStatus === 'completed')
            .map((pickup: any) => ({
              _id: pickup._id,
              pickupId: pickup.pickupId || pickup._id.slice(-6),
              deviceType: pickup.deviceType || 'Electronic Device',
              proposedAmount: pickup.proposedAmount || 0,
              finalAmount: pickup.finalAmount,
              status: pickup.paymentStatus || 'pending',
              createdAt: pickup.createdAt || new Date().toISOString(),
              paidAt: pickup.paidAt,
              userDetails: pickup.userDetails,
              inspectionNotes: pickup.inspectionNotes
            }));
          setPayments(paymentsData);
        } else {
          setPayments(generateMockPayments());
        }
      } else {
        setPayments(generateMockPayments());
      }
    } catch (err: any) {
      console.error('Payment loading error:', err);
      setError('Failed to load payments. Showing sample data.');
      setPayments(generateMockPayments());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockPayments = (): Payment[] => {
    return [
      {
        _id: '1',
        pickupId: 'PKP001',
        deviceType: 'iPhone 12',
        proposedAmount: 25000,
        finalAmount: 24000,
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        paidAt: new Date(Date.now() - 86400000).toISOString(),
        userDetails: { name: 'John Doe', phone: '9876543210' },
        inspectionNotes: 'Good condition, minor scratches'
      },
      {
        _id: '2',
        pickupId: 'PKP002',
        deviceType: 'Dell Laptop XPS 13',
        proposedAmount: 15000,
        status: 'proposed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userDetails: { name: 'Jane Smith', phone: '9876543211' },
        inspectionNotes: 'Screen has minor scratches, battery health is 85%'
      },
      {
        _id: '3',
        pickupId: 'PKP003',
        deviceType: 'Samsung Galaxy Tab',
        proposedAmount: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userDetails: { name: 'Mike Wilson', phone: '9876543212' },
        inspectionNotes: 'Inspection completed, need to propose payment'
      }
    ];
  };

  const handleProposePayment = async () => {
    if (!selectedPayment || !proposalData.amount) return;

    try {
      setIsProcessing(true);
      setError('');

      const paymentData = {
        proposedAmount: parseFloat(proposalData.amount),
        paymentNotes: proposalData.notes,
        proposedAt: new Date().toISOString()
      };

      await recyclerPickupAPI.proposePayment(selectedPayment._id, paymentData);

      // Update local state
      setPayments(prev => prev.map(payment => 
        payment._id === selectedPayment._id 
          ? { 
              ...payment, 
              proposedAmount: parseFloat(proposalData.amount),
              status: 'proposed'
            }
          : payment
      ));

      setSelectedPayment(null);
      setProposalData({ amount: '', notes: '' });

    } catch (err: any) {
      setError('Failed to propose payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizePayment = async (paymentId: string) => {
    try {
      setIsProcessing(true);
      
      const paymentData = {
        finalAmount: payments.find(p => p._id === paymentId)?.proposedAmount,
        paidAt: new Date().toISOString(),
        paymentMethod: 'bank_transfer'
      };

      await recyclerPickupAPI.finalizePayment(paymentId, paymentData);

      // Update local state
      setPayments(prev => prev.map(payment => 
        payment._id === paymentId 
          ? { 
              ...payment, 
              status: 'completed',
              finalAmount: payment.proposedAmount,
              paidAt: new Date().toISOString()
            }
          : payment
      ));

    } catch (err: any) {
      setError('Failed to finalize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'proposed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.finalAmount || 0), 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const proposedPayments = payments.filter(p => p.status === 'proposed');
  const completedPayments = payments.filter(p => p.status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
        <p className="text-gray-600">Manage payments for inspected e-waste</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Earnings</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
          <div className="text-sm text-gray-600">Pending Proposals</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{proposedPayments.length}</div>
          <div className="text-sm text-gray-600">Awaiting Approval</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{completedPayments.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Pending Payment Proposals */}
      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Pending Payment Proposals ({pendingPayments.length})
            </h2>
          </div>
          <div className="divide-y">
            {pendingPayments.map((payment) => (
              <div key={payment._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{payment.deviceType}</h3>
                    <p className="text-sm text-gray-600">
                      Pickup ID: {payment.pickupId}
                    </p>
                    {payment.userDetails && (
                      <p className="text-sm text-gray-600">
                        Customer: {payment.userDetails.name}
                      </p>
                    )}
                    {payment.inspectionNotes && (
                      <p className="text-sm text-gray-500 mt-1">
                        Notes: {payment.inspectionNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Propose Payment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposed Payments */}
      {proposedPayments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Proposed Payments ({proposedPayments.length})
            </h2>
          </div>
          <div className="divide-y">
            {proposedPayments.map((payment) => (
              <div key={payment._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{payment.deviceType}</h3>
                    <p className="text-sm text-gray-600">
                      Pickup ID: {payment.pickupId} • Proposed: ₹{payment.proposedAmount.toLocaleString()}
                    </p>
                    {payment.userDetails && (
                      <p className="text-sm text-gray-600">
                        Customer: {payment.userDetails.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleFinalizePayment(payment._id)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Finalize Payment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment History ({payments.length})
          </h2>
        </div>
        
        {payments.length > 0 ? (
          <div className="divide-y">
            {payments.map((payment) => (
              <div key={payment._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{payment.deviceType}</h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>Pickup ID: {payment.pickupId}</span>
                      <span>
                        {payment.status === 'completed' && payment.finalAmount
                          ? `Paid: ₹${payment.finalAmount.toLocaleString()}`
                          : payment.proposedAmount > 0
                          ? `Proposed: ₹${payment.proposedAmount.toLocaleString()}`
                          : 'Amount: TBD'
                        }
                      </span>
                      <span>
                        {payment.paidAt 
                          ? `Paid: ${new Date(payment.paidAt).toLocaleDateString()}`
                          : `Created: ${new Date(payment.createdAt).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                    {payment.userDetails && (
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {payment.userDetails.name} • {payment.userDetails.phone}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">💰</span>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No payments yet</h3>
            <p className="text-gray-600">
              Payment records will appear here after you complete inspections
            </p>
          </div>
        )}
      </div>

      {/* Payment Proposal Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Propose Payment</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Device</label>
                  <p className="text-gray-800">{selectedPayment.deviceType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup ID</label>
                  <p className="text-gray-800">{selectedPayment.pickupId}</p>
                </div>

                {selectedPayment.userDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-gray-800">
                      {selectedPayment.userDetails.name} • {selectedPayment.userDetails.phone}
                    </p>
                  </div>
                )}

                {selectedPayment.inspectionNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inspection Notes</label>
                    <p className="text-gray-800 text-sm">{selectedPayment.inspectionNotes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={proposalData.amount}
                    onChange={(e) => setProposalData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter proposed amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    value={proposalData.notes}
                    onChange={(e) => setProposalData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Additional notes about the payment..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleProposePayment}
                    disabled={isProcessing || !proposalData.amount}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Proposing...' : 'Propose Payment'}
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
