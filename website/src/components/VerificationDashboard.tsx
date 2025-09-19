import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  CheckCircle, 
  Clock, 
  Recycle,
  FileText,
  TreePine,
  Zap,
  BarChart3,
  Download,
  QrCode,
  ExternalLink
} from 'lucide-react';

interface VerificationDashboardProps {
  pickupId: string;
  userId?: string;
  recyclerView?: boolean;
}

interface VerificationData {
  pickup: {
    id: string;
    deviceType: string;
    pickupAddress: string;
    scheduledDate: string;
    status: string;
    userId: string;
    recyclerId: string;
  };
  inspection: {
    id: string;
    inspectionDate: string;
    physicalDamage: number;
    workingComponents: string[];
    reusableSemiconductors: number;
    scrapValue: number;
    inspectionImages: string[];
    damageImages: string[];
    inspectionNotes: string;
    inspectorId: string;
  };
  environmentalImpact: {
    co2Saved: number;
    energySaved: number;
    materialsRecovered: string[];
    recyclingDate: string;
  };
  blockchain: {
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
    verified: boolean;
  };
  recyclingProcess: {
    stages: Array<{
      stage: string;
      completedAt: string;
      verifiedBy: string;
      images: string[];
      notes: string;
    }>;
  };
}

const VerificationDashboard: React.FC<VerificationDashboardProps> = ({
  pickupId,
  userId,
  recyclerView = false
}) => {
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'environmental' | 'audit'>('overview');

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(recyclerView ? 'recyclerToken' : 'userToken');
        
        const response = await fetch(`/api/verification/${pickupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        
        if (result.success) {
          setVerificationData(result.data);
        } else {
          setError(result.message || 'Failed to fetch verification data');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Verification fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (pickupId) {
      fetchVerificationData();
    }
  }, [pickupId, recyclerView]);

  const generateCertificate = async () => {
    try {
      const token = localStorage.getItem(recyclerView ? 'recyclerToken' : 'userToken');
      const response = await fetch(`/api/verification/${pickupId}/certificate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `e-waste-certificate-${pickupId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': case 'under inspection': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No verification data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">E-waste Verification Dashboard</h1>
                <p className="text-gray-600">Device: {verificationData.pickup.deviceType}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={generateCertificate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Certificate
              </button>
              <div className="flex items-center text-sm text-gray-500">
                <QrCode className="w-4 h-4 mr-1" />
                ID: {pickupId.slice(-8)}
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Pickup Scheduled</p>
                <p className="text-xs text-gray-500">{new Date(verificationData.pickup.scheduledDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                verificationData.inspection ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Eye className={`w-5 h-5 ${verificationData.inspection ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Inspection</p>
                <p className="text-xs text-gray-500">
                  {verificationData.inspection 
                    ? new Date(verificationData.inspection.inspectionDate).toLocaleDateString()
                    : 'Pending'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                verificationData.environmentalImpact ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Recycle className={`w-5 h-5 ${verificationData.environmentalImpact ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Recycling</p>
                <p className="text-xs text-gray-500">
                  {verificationData.environmentalImpact?.recyclingDate 
                    ? new Date(verificationData.environmentalImpact.recyclingDate).toLocaleDateString()
                    : 'Not started'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                verificationData.blockchain?.verified ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Shield className={`w-5 h-5 ${verificationData.blockchain?.verified ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Verified</p>
                <p className="text-xs text-gray-500">
                  {verificationData.blockchain?.verified ? 'Blockchain Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'inspection', label: 'Inspection Details', icon: Eye },
                { key: 'environmental', label: 'Environmental Impact', icon: TreePine },
                { key: 'audit', label: 'Audit Trail', icon: FileText }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Device Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Device Type:</span>
                    <p className="text-sm text-gray-900">{verificationData.pickup.deviceType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Pickup Address:</span>
                    <p className="text-sm text-gray-900">{verificationData.pickup.pickupAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(verificationData.pickup.status)}`}>
                      {verificationData.pickup.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Environmental Summary */}
              {verificationData.environmentalImpact && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <TreePine className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{verificationData.environmentalImpact.co2Saved} kg</p>
                        <p className="text-sm text-gray-500">CO₂ Emissions Saved</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{verificationData.environmentalImpact.energySaved} kWh</p>
                        <p className="text-sm text-gray-500">Energy Saved</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Recycle className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{verificationData.environmentalImpact.materialsRecovered.length}</p>
                        <p className="text-sm text-gray-500">Materials Recovered</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                <div className="space-y-3">
                  {verificationData.blockchain?.verified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Blockchain Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium">Verification Pending</span>
                    </div>
                  )}
                  
                  {verificationData.blockchain?.transactionHash && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Transaction Hash:</span>
                      <p className="text-xs text-gray-900 font-mono break-all">
                        {verificationData.blockchain.transactionHash}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inspection Details Tab */}
          {activeTab === 'inspection' && verificationData.inspection && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Inspection Details</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Condition Assessment</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Physical Damage:</span>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${verificationData.inspection.physicalDamage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{verificationData.inspection.physicalDamage}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Reusable Semiconductors:</span>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${verificationData.inspection.reusableSemiconductors}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{verificationData.inspection.reusableSemiconductors}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Scrap Value:</span>
                        <p className="text-lg font-semibold text-gray-900">₹{verificationData.inspection.scrapValue}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Working Components</h4>
                    <div className="flex flex-wrap gap-2">
                      {verificationData.inspection.workingComponents.map((component, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                        >
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>

                  {verificationData.inspection.inspectionNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Inspector Notes</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {verificationData.inspection.inspectionNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Documentation</h4>
                  
                  {verificationData.inspection.inspectionImages.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Inspection Images</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {verificationData.inspection.inspectionImages.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Inspection ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                      {verificationData.inspection.inspectionImages.length > 4 && (
                        <p className="text-sm text-gray-500 mt-2">
                          +{verificationData.inspection.inspectionImages.length - 4} more images
                        </p>
                      )}
                    </div>
                  )}

                  {verificationData.inspection.damageImages.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Damage Documentation</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {verificationData.inspection.damageImages.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Damage ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Environmental Impact Tab */}
          {activeTab === 'environmental' && verificationData.environmentalImpact && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <TreePine className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-3xl font-bold text-gray-900">{verificationData.environmentalImpact.co2Saved}</p>
                  <p className="text-sm text-gray-600">kg CO₂ Emissions Saved</p>
                  <p className="text-xs text-gray-500 mt-2">Equivalent to planting 2 tree seedlings</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <p className="text-3xl font-bold text-gray-900">{verificationData.environmentalImpact.energySaved}</p>
                  <p className="text-sm text-gray-600">kWh Energy Saved</p>
                  <p className="text-xs text-gray-500 mt-2">Powers a home for 2.3 days</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <Recycle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-3xl font-bold text-gray-900">{verificationData.environmentalImpact.materialsRecovered.length}</p>
                  <p className="text-sm text-gray-600">Materials Recovered</p>
                  <p className="text-xs text-gray-500 mt-2">Precious metals & components</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recovered Materials</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {verificationData.environmentalImpact.materialsRecovered.map((material, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">{material}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tamper-Proof Audit Trail</h3>
              
              <div className="space-y-6">
                {verificationData.recyclingProcess?.stages.map((stage, index) => (
                  <div key={index} className="relative">
                    {index !== verificationData.recyclingProcess.stages.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
                    )}
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{stage.stage}</h4>
                          <span className="text-xs text-gray-500">{new Date(stage.completedAt).toLocaleString()}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">Verified by: {stage.verifiedBy}</p>
                        
                        {stage.notes && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">{stage.notes}</p>
                        )}
                        
                        {stage.images.length > 0 && (
                          <div className="flex space-x-2">
                            {stage.images.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={image}
                                alt={`${stage.stage} ${imgIndex + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => window.open(image, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Blockchain Verification */}
                {verificationData.blockchain?.verified && (
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">Blockchain Verification</h4>
                          <span className="text-xs text-gray-500">{new Date(verificationData.blockchain.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Transaction Hash:</span>
                            <p className="text-xs text-gray-900 font-mono break-all">{verificationData.blockchain.transactionHash}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Block Number:</span>
                            <span className="text-xs text-gray-900 ml-2">{verificationData.blockchain.blockNumber}</span>
                            <a 
                              href={`https://etherscan.io/block/${verificationData.blockchain.blockNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationDashboard;