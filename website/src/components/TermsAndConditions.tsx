import React, { useState } from 'react';
import { CheckCircle, FileText, Shield, Users, AlertTriangle } from 'lucide-react';

interface TermsAndConditionsProps {
  userType?: 'recycler' | 'delivery' | 'general';
  showAcceptance?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ 
  userType = 'general', 
  showAcceptance = false,
  onAccept,
  onDecline 
}) => {
  const [accepted, setAccepted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAccept = () => {
    setAccepted(true);
    if (onAccept) {
      onAccept();
    }
  };

  const renderRecyclerSpecificTerms = () => (
    <div className="space-y-6">
      <section className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Recycler Agreement
        </h3>
        <div className="text-sm text-blue-800 mb-4">
          <p><strong>Effective Date:</strong> September 19, 2025</p>
          <p><strong>Between:</strong> Recycle'IT Pvt. Ltd. and Authorized Recycler</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={() => toggleSection('purpose')}
              className="flex items-center justify-between w-full text-left font-medium text-blue-900 hover:text-blue-700"
            >
              <span>1. Purpose</span>
              <span>{expandedSection === 'purpose' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'purpose' && (
              <div className="mt-2 text-blue-800 pl-4">
                This Agreement defines the terms and conditions under which Recycler will collect, 
                handle, and recycle e-waste through the Recycle'IT platform while ensuring user trust, 
                transparency, and compliance with applicable laws.
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('responsibilities')}
              className="flex items-center justify-between w-full text-left font-medium text-blue-900 hover:text-blue-700"
            >
              <span>2. Roles & Responsibilities</span>
              <span>{expandedSection === 'responsibilities' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'responsibilities' && (
              <div className="mt-2 text-blue-800 pl-4 space-y-3">
                <div>
                  <h4 className="font-medium">Trust & Safety</h4>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Ensure all staff are verified, trained, and behave professionally</li>
                    <li>Use only authorized personnel with valid company-issued ID cards</li>
                    <li>Maintain confidentiality of user information</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Pickup & Drop Service</h4>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Provide timely and reliable pickup service as scheduled</li>
                    <li>Ensure proper handling, transport, and storage of items</li>
                    <li>Transfer items strictly to certified recycling facilities only</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Payments & Communication</h4>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Accept payments only via Recycle'IT platform</li>
                    <li>Ensure transparency in valuation and payouts</li>
                    <li>Communicate clearly regarding timings and disputes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Compliance with Law</h4>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Adhere to environmental, labor, and recycling laws</li>
                    <li>Maintain required licenses and certifications</li>
                    <li>Follow E-Waste Management Rules and EPR obligations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Fraud & Misuse Prevention</h4>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Refrain from selling to informal or unverified channels</li>
                    <li>Prevent duplicate or fraudulent reporting</li>
                    <li>Report suspicious activity immediately</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('company-obligations')}
              className="flex items-center justify-between w-full text-left font-medium text-blue-900 hover:text-blue-700"
            >
              <span>3. Obligations of Recycle'IT</span>
              <span>{expandedSection === 'company-obligations' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'company-obligations' && (
              <div className="mt-2 text-blue-800 pl-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide platform access and management tools</li>
                  <li>Ensure secure, digital, and timely payments</li>
                  <li>Offer training on platform usage and compliance</li>
                  <li>Provide visibility via dashboards and eco-impact tracking</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  const renderDeliverySpecificTerms = () => (
    <div className="space-y-6">
      <section className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Delivery Partner Agreement
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-green-900">Service Standards</h4>
            <ul className="list-disc list-inside mt-2 text-green-800 space-y-1">
              <li>Maintain professional behavior and punctuality</li>
              <li>Follow designated pickup and delivery routes</li>
              <li>Handle all items with care to prevent damage</li>
              <li>Ensure timely completion of assigned tasks</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-green-900">Safety Requirements</h4>
            <ul className="list-disc list-inside mt-2 text-green-800 space-y-1">
              <li>Carry valid identification and authorization documents</li>
              <li>Follow all traffic and safety regulations</li>
              <li>Use appropriate protective equipment when handling e-waste</li>
              <li>Report any safety incidents immediately</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-green-900">Payment Terms</h4>
            <ul className="list-disc list-inside mt-2 text-green-800 space-y-1">
              <li>All payments processed through platform only</li>
              <li>No cash transactions or offline payments accepted</li>
              <li>Compensation based on completed deliveries</li>
              <li>Payment disputes handled through platform support</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );

  const renderGeneralTerms = () => (
    <div className="space-y-6">
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">General Terms & Conditions</h3>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={() => toggleSection('payments')}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
            >
              <span>4. Payments</span>
              <span>{expandedSection === 'payments' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'payments' && (
              <div className="mt-2 text-gray-700 pl-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>All user payments routed through Recycle'IT platform</li>
                  <li>Payouts net of platform service fees as agreed</li>
                  <li>Payments made to registered bank account within specified business days</li>
                  <li>No off-platform or cash-based payments permitted</li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('confidentiality')}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
            >
              <span>5. Confidentiality</span>
              <span>{expandedSection === 'confidentiality' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'confidentiality' && (
              <div className="mt-2 text-gray-700 pl-4">
                Partner agrees to keep confidential all user data, payment records, and platform-related 
                information, and not disclose it to unauthorized third parties.
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('liability')}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
            >
              <span>6. Liability & Indemnity</span>
              <span>{expandedSection === 'liability' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'liability' && (
              <div className="mt-2 text-gray-700 pl-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>Partner liable for loss, damage, or misuse of user property during service</li>
                  <li>Partner agrees to indemnify and hold harmless the Company from claims and damages</li>
                  <li>Company not liable for partner's non-compliance or misconduct</li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('termination')}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
            >
              <span>7. Term & Termination</span>
              <span>{expandedSection === 'termination' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'termination' && (
              <div className="mt-2 text-gray-700 pl-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>Agreement valid until terminated with 30 days written notice</li>
                  <li>Immediate termination for fraud, misuse, or breach of trust</li>
                  <li>Termination for violation of applicable laws</li>
                  <li>Termination for repeated complaints or service failures</li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('dispute')}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
            >
              <span>8. Dispute Resolution</span>
              <span>{expandedSection === 'dispute' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'dispute' && (
              <div className="mt-2 text-gray-700 pl-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>Disputes first attempted to be resolved amicably</li>
                  <li>Unresolved disputes referred to arbitration under Arbitration and Conciliation Act, 1996</li>
                  <li>Jurisdiction: Navi Mumbai, India</li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleSection('miscellaneous')}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
            >
              <span>9. Miscellaneous</span>
              <span>{expandedSection === 'miscellaneous' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'miscellaneous' && (
              <div className="mt-2 text-gray-700 pl-4">
                <ul className="list-disc list-inside space-y-1">
                  <li>No employer-employee relationship created; partner acts as independent contractor</li>
                  <li>Rights/obligations may not be assigned without prior written consent</li>
                  <li>Agreement governed by laws of India</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Terms & Conditions
                </h1>
                <p className="text-green-100 mt-1">
                  {userType === 'recycler' && 'Recycler Partnership Agreement'}
                  {userType === 'delivery' && 'Delivery Partner Agreement'}
                  {userType === 'general' && 'General Terms & Conditions'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span>Please read these terms carefully before proceeding</span>
              </div>
            </div>

            {/* Render specific terms based on user type */}
            {userType === 'recycler' && renderRecyclerSpecificTerms()}
            {userType === 'delivery' && renderDeliverySpecificTerms()}
            {renderGeneralTerms()}

            {/* Important Notice */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-yellow-800">Important Notice</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    By accepting these terms, you acknowledge that you have read, understood, and agree to be bound by all provisions outlined above. 
                    Violation of these terms may result in immediate termination of your partnership with Recycle'IT.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance Section */}
            {showAcceptance && (
              <div className="mt-8 border-t pt-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="accept-terms" className="text-sm text-gray-700">
                    I have read and agree to the Terms & Conditions and understand my obligations as outlined above.
                  </label>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handleAccept}
                    disabled={!accepted}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                      accepted
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept Terms
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
            )}

            {/* Signature Section for Display */}
            {!showAcceptance && (
              <div className="mt-8 border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Company Representative</h4>
                    <div className="border-b border-gray-300 pb-2 mb-2">
                      <span className="text-sm text-gray-600">Authorized Signatory, Recycle'IT Pvt. Ltd.</span>
                    </div>
                    <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {userType === 'recycler' ? 'Recycler' : 'Delivery Partner'} Representative
                    </h4>
                    <div className="border-b border-gray-300 pb-2 mb-2">
                      <span className="text-sm text-gray-600">Authorized Representative</span>
                    </div>
                    <p className="text-xs text-gray-500">Date: __________</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;