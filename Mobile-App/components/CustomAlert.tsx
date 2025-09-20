import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Define alert types
export type AlertType = 'success' | 'error' | 'warning' | 'info';

// Define button interface
export interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

// Define alert configuration interface
export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  primaryButton?: AlertButton;
  secondaryButton?: AlertButton;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// Define alert context interface
interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  AlertComponent: React.ComponentType;
}

// Create alert context
const AlertContext = React.createContext<AlertContextType | null>(null);

// Alert icon mapping
const getAlertIcon = (type: AlertType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'close-circle';
    case 'warning':
      return 'warning';
    case 'info':
      return 'information-circle';
    default:
      return 'information-circle';
  }
};

// Alert color mapping
const getAlertColors = (type: AlertType) => {
  switch (type) {
    case 'success':
      return {
        background: '#dcfce7',
        border: '#22c55e',
        icon: '#16a34a',
        title: '#166534',
        message: '#15803d',
        primaryButton: '#16a34a',
        secondaryButton: '#6b7280',
      };
    case 'error':
      return {
        background: '#fef2f2',
        border: '#ef4444',
        icon: '#dc2626',
        title: '#991b1b',
        message: '#b91c1c',
        primaryButton: '#dc2626',
        secondaryButton: '#6b7280',
      };
    case 'warning':
      return {
        background: '#fffbeb',
        border: '#f59e0b',
        icon: '#d97706',
        title: '#92400e',
        message: '#a16207',
        primaryButton: '#d97706',
        secondaryButton: '#6b7280',
      };
    case 'info':
      return {
        background: '#eff6ff',
        border: '#3b82f6',
        icon: '#2563eb',
        title: '#1e40af',
        message: '#2563eb',
        primaryButton: '#2563eb',
        secondaryButton: '#6b7280',
      };
    default:
      return {
        background: '#f9fafb',
        border: '#6b7280',
        icon: '#6b7280',
        title: '#374151',
        message: '#6b7280',
        primaryButton: '#6b7280',
        secondaryButton: '#6b7280',
      };
  }
};

// Custom Alert Component
const CustomAlert: React.FC<{
  visible: boolean;
  config: AlertConfig | null;
  onClose: () => void;
}> = ({ visible, config, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [fadeAnim, scaleAnim, slideAnim, onClose]);

  useEffect(() => {
    if (visible && config) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close if configured
      if (config.autoClose && config.autoCloseDelay) {
        const timer = setTimeout(() => {
          handleClose();
        }, config.autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, config, fadeAnim, scaleAnim, slideAnim, handleClose]);

  const handlePrimaryPress = () => {
    if (config?.primaryButton?.onPress) {
      config.primaryButton.onPress();
    }
    handleClose();
  };

  const handleSecondaryPress = () => {
    if (config?.secondaryButton?.onPress) {
      config.secondaryButton.onPress();
    }
    handleClose();
  };

  if (!config) return null;

  const colors = getAlertColors(config.type);
  const iconName = getAlertIcon(config.type);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
          activeOpacity={1}
        />
        
        <Animated.View
          style={{
            backgroundColor: colors.background,
            borderRadius: 20,
            padding: 24,
            maxWidth: width - 40,
            minWidth: width * 0.8,
            borderWidth: 2,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 10,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          }}
        >
          {/* Header with Icon */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.icon + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name={iconName} size={32} color={colors.icon} />
            </View>
            
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.title,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {config.title}
            </Text>
            
            <Text
              style={{
                fontSize: 16,
                color: colors.message,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              {config.message}
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ marginTop: 20 }}>
            {config.primaryButton && (
              <TouchableOpacity
                onPress={handlePrimaryPress}
                style={{
                  backgroundColor: colors.primaryButton,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  marginBottom: config.secondaryButton ? 12 : 0,
                  shadowColor: colors.primaryButton,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {config.primaryButton.text}
                </Text>
              </TouchableOpacity>
            )}

            {config.secondaryButton && (
              <TouchableOpacity
                onPress={handleSecondaryPress}
                style={{
                  backgroundColor: 'transparent',
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.secondaryButton + '40',
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: colors.secondaryButton,
                    fontSize: 16,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {config.secondaryButton.text}
                </Text>
              </TouchableOpacity>
            )}

            {!config.primaryButton && !config.secondaryButton && (
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  backgroundColor: colors.primaryButton,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  shadowColor: colors.primaryButton,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Alert Provider Component
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
    setTimeout(() => {
      setAlertConfig(null);
    }, 300);
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={alertVisible}
      config={alertConfig}
      onClose={hideAlert}
    />
  );

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, AlertComponent }}>
      {children}
      <AlertComponent />
    </AlertContext.Provider>
  );
};

// Hook to use alert
export const useCustomAlert = (): AlertContextType => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useCustomAlert must be used within an AlertProvider');
  }
  return context;
};

// Export default component for direct usage
export default CustomAlert;
