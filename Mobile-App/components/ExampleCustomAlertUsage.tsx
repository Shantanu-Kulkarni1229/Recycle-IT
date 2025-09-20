// Example usage of CustomAlert component
// This file demonstrates how to use the CustomAlert in your components

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useCustomAlert } from '../components/CustomAlert';

const ExampleUsage: React.FC = () => {
  const { showAlert } = useCustomAlert();

  const showSuccessAlert = () => {
    showAlert({
      type: 'success',
      title: '🎉 Success!',
      message: 'Your action was completed successfully.',
      primaryButton: {
        text: 'Continue',
        onPress: () => {
          console.log('Continue pressed');
        }
      }
    });
  };

  const showErrorAlert = () => {
    showAlert({
      type: 'error',
      title: 'Error Occurred',
      message: 'Something went wrong. Please try again.',
      primaryButton: {
        text: 'Retry',
        onPress: () => {
          console.log('Retry pressed');
        }
      },
      secondaryButton: {
        text: 'Cancel',
        onPress: () => {
          console.log('Cancel pressed');
        }
      }
    });
  };

  const showWarningAlert = () => {
    showAlert({
      type: 'warning',
      title: 'Warning',
      message: 'This action cannot be undone. Are you sure?',
      primaryButton: {
        text: 'Proceed',
        onPress: () => {
          console.log('Proceed pressed');
        }
      },
      secondaryButton: {
        text: 'Cancel',
        onPress: () => {
          console.log('Cancel pressed');
        }
      }
    });
  };

  const showInfoAlert = () => {
    showAlert({
      type: 'info',
      title: 'Information',
      message: 'Here is some important information for you.',
      autoClose: true,
      autoCloseDelay: 3000
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TouchableOpacity
        onPress={showSuccessAlert}
        style={{ backgroundColor: '#22c55e', padding: 15, borderRadius: 10, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Show Success Alert
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={showErrorAlert}
        style={{ backgroundColor: '#ef4444', padding: 15, borderRadius: 10, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Show Error Alert
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={showWarningAlert}
        style={{ backgroundColor: '#f59e0b', padding: 15, borderRadius: 10, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Show Warning Alert
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={showInfoAlert}
        style={{ backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Show Info Alert (Auto Close)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExampleUsage;