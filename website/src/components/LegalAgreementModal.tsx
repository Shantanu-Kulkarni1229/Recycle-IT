import React, { useState } from 'react';
import TermsAndConditions from '../components/TermsAndConditions';
import CodeOfConduct from '../components/CodeOfConduct';
import { CheckCircle, X, FileText, Shield } from 'lucide-react';

interface LegalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'recycler' | 'delivery';
  onAccept: () => void;
  onDecline: () => void;
}

const LegalAgreementModal: React.FC<LegalAgreementModalProps> = ({
  isOpen,
  onClose,
  userType,
  onAccept,
  onDecline
}) => {
  const [currentStep, setCurrentStep] = useState<'terms' | 'conduct'>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [conductAccepted, setConductAccepted] = useState(false);

  if (!isOpen) return null;

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setCurrentStep('conduct');
  };

  const handleConductAccept = () => {
    setConductAccepted(true);
    onAccept();
  };

  const handleDecline = () => {
    setTermsAccepted(false);
    setConductAccepted(false);
    setCurrentStep('terms');
    onDecline();
  };

  const canProceed = termsAccepted && conductAccepted;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                {currentStep === 'terms' ? (
                  <FileText className="w-6 h-6 text-blue-600" />
                ) : (
                  <Shield className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentStep === 'terms' ? 'Terms & Conditions' : 'Code of Conduct'}
                </h2>
                <p className="text-sm text-gray-600">
                  {userType === 'recycler' ? 'Recycler' : 'Delivery Partner'} Agreement - Step {currentStep === 'terms' ? '1' : '2'} of 2
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="py-4">
            <div className="flex items-center">
              <div className={`flex items-center ${termsAccepted ? 'text-green-600' : 'text-blue-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  termsAccepted ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {termsAccepted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">1</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">Terms & Conditions</span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 rounded ${termsAccepted ? 'bg-green-300' : 'bg-gray-200'}`} />
              
              <div className={`flex items-center ${conductAccepted ? 'text-green-600' : termsAccepted ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  conductAccepted ? 'bg-green-100' : termsAccepted ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {conductAccepted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">2</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">Code of Conduct</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="py-4 max-h-96 overflow-y-auto">
            {currentStep === 'terms' ? (
              <TermsAndConditions
                userType={userType}
                showAcceptance={true}
                onAccept={handleTermsAccept}
                onDecline={handleDecline}
              />
            ) : (
              <CodeOfConduct
                staffType={userType === 'recycler' ? 'pickup' : 'delivery'}
                showAcknowledgment={true}
                onAcknowledge={handleConductAccept}
                onDecline={handleDecline}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span>
                Please read and accept both documents to complete registration
              </span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {currentStep === 'conduct' && termsAccepted && (
                <button
                  onClick={() => setCurrentStep('terms')}
                  className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  Back to Terms
                </button>
              )}
              
              {canProceed && (
                <button
                  onClick={onAccept}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Registration
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAgreementModal;