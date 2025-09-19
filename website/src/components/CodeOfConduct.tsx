import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileText, Users, Eye, Lock, Truck, Ban } from 'lucide-react';

interface CodeOfConductProps {
  staffType?: 'pickup' | 'delivery' | 'general';
  showAcknowledgment?: boolean;
  onAcknowledge?: () => void;
  onDecline?: () => void;
}

const CodeOfConduct: React.FC<CodeOfConductProps> = ({ 
  staffType = 'general',
  showAcknowledgment = false,
  onAcknowledge,
  onDecline
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledge = () => {
    setAcknowledged(true);
    if (onAcknowledge) {
      onAcknowledge();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-8">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Code of Conduct
                </h1>
                <p className="text-red-100 mt-1">
                  {staffType === 'pickup' && 'For Pickup Staff'}
                  {staffType === 'delivery' && 'For Delivery Personnel'}
                  {staffType === 'general' && 'For All Staff Members'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Introduction */}
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-blue-800">Code Application</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      This Code of Conduct applies to all pickup and delivery personnel engaged by Recyclers and Delivery Partners 
                      under their respective agreements with Recycle'IT Pvt. Ltd. Every staff member must strictly follow these 
                      guidelines to ensure trust, safety, and professionalism.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Sections */}
            <div className="space-y-8">
              {/* 1. Identification & Verification */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  1. Identification & Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Must carry valid company ID card at all times</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Provide ID verification to users on request</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Only authorized staff registered with Recycle'IT may perform pickups</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Maintain updated registration and certification documents</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Professional Behavior */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  2. Professional Behavior
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Be polite, respectful, and professional in all interactions</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-gray-700">No abusive, threatening, or discriminatory behavior</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Avoid unnecessary conversation or solicitation</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Maintain professional appearance and hygiene standards</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Safety & Security */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-yellow-600" />
                  3. Safety & Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Handle all items carefully to avoid damage</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <span className="text-gray-700">Ensure data security: do not access or misuse user devices</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-gray-700">Do not open or tamper with items during transport</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Follow safety guidelines while carrying, loading, and unloading</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span className="text-gray-700">Report safety incidents immediately to supervisors</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Use appropriate protective equipment when handling e-waste</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Transparency & Payments */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  4. Transparency & Payments
                </h3>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-red-800">Strictly Prohibited</h4>
                        <p className="text-red-700 text-sm mt-1">
                          Never demand or accept cash/offline payments from users
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-gray-700">Inform users that all payments are processed securely through platform</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-gray-700">Provide pickup confirmation via app before leaving premises</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Confidentiality */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                  5. Confidentiality
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <span className="text-gray-700">Respect user privacy: never share or misuse personal details</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-gray-700">Do not photograph or record user property without consent</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <span className="text-gray-700">Protect confidential information: address, phone, device type, etc.</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Follow data protection guidelines at all times</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. Compliance */}
              <section className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-teal-600" />
                  6. Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Wear proper uniform (if provided) and follow hygiene standards</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Comply with traffic and safety laws while transporting e-waste</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Deliver items only to authorized recycling facilities</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-gray-700">Follow all environmental and regulatory guidelines</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 7. Prohibited Actions */}
              <section className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
                  <Ban className="w-5 h-5 mr-2 text-red-600" />
                  7. Prohibited Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-red-800">Accepting gifts, tips, or personal favors from users</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-red-800">Subcontracting pickups to unregistered personnel</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-red-800">Diverting collected items to unauthorized channels</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-red-800">Misreporting or falsifying pickup details</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 8. Disciplinary Action */}
              <section className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                <h3 className="text-xl font-semibold text-orange-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                  8. Disciplinary Action
                </h3>
                <p className="text-orange-800 mb-4">
                  Any violation of this Code of Conduct may result in:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span className="text-orange-800">Immediate suspension or blacklisting of staff</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span className="text-orange-800">Termination of partner's agreement with Recycle'IT</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span className="text-orange-800">Legal action for fraud, theft, or violation of law</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Acknowledgment Section */}
            {showAcknowledgment && (
              <div className="mt-8 border-t pt-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Acknowledgment</h3>
                  
                  <div className="flex items-start space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="acknowledge-conduct"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="acknowledge-conduct" className="text-sm text-gray-700">
                      I, the undersigned staff member, have read and understood the above Code of Conduct. 
                      I agree to follow it strictly while performing duties on behalf of Recycle'IT.
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAcknowledge}
                      disabled={!acknowledged}
                      className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                        acknowledged
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Acknowledge
                    </button>
                    
                    {onDecline && (
                      <button
                        onClick={onDecline}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Signature Section for Display */}
            {!showAcknowledgment && (
              <div className="mt-8 border-t pt-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Acknowledgment</h3>
                  <p className="text-gray-700 mb-6">
                    I, the undersigned {staffType} staff member, have read and understood the above Code of Conduct. 
                    I agree to follow it strictly while performing duties on behalf of Recycle'IT.
                  </p>
                  
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeOfConduct;