import React from 'react';import React from 'react';import React from 'react';import React from 'react';

import {

  Modal,import {

  View,

  Text,  Modal,import {import {

  TouchableOpacity,

  Animated,  View,

  Dimensions,

  StatusBar,  Text,  Modal,  Modal,

} from 'react-native';

import { Ionicons } from '@expo/vector-icons';  TouchableOpacity,



const { width } = Dimensions.get('window');  Animated,  View,  View,



interface CustomAlertProps {  Dimensions,

  visible: boolean;

  onClose: () => void;  StatusBar,  Text,  Text,

  title: string;

  message: string;} from 'react-native';

  type?: 'success' | 'error' | 'info' | 'warning' | 'celebration';

  primaryButton?: {import { Ionicons } from '@expo/vector-icons';  TouchableOpacity,  TouchableOpacity,

    text: string;

    onPress: () => void;

  };

  secondaryButton?: {const { width } = Dimensions.get('window');  Animated,  Animated,

    text: string;

    onPress: () => void;

  };

  autoClose?: number;interface CustomAlertProps {  Dimensions,  Dimensions,

}

  visible: boolean;

export const CustomAlert: React.FC<CustomAlertProps> = ({

  visible,  onClose: () => void;  StatusBar,  StatusBar,

  onClose,

  title,  title: string;

  message,

  type = 'info',  message: string;} from 'react-native';} from 'react-native';

  primaryButton,

  secondaryButton,  type?: 'success' | 'error' | 'info' | 'warning' | 'celebration' | 'question';

  autoClose,

}) => {  primaryButton?: {import { Ionicons } from '@expo/vector-icons';import { Ionicons } from '@expo/vector-icons';

  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  const opacityAnim = React.useRef(new Animated.Value(0)).current;    text: string;



  React.useEffect(() => {    onPress: () => void;

    if (visible) {

      Animated.parallel([  };

        Animated.timing(opacityAnim, {

          toValue: 1,  secondaryButton?: {const { width } = Dimensions.get('window');const { width } = Dimensions.get('window');

          duration: 200,

          useNativeDriver: true,    text: string;

        }),

        Animated.spring(scaleAnim, {    onPress: () => void;

          toValue: 1,

          tension: 120,  };

          friction: 8,

          useNativeDriver: true,  autoClose?: number;interface CustomAlertProps {interface CustomAlertProps {

        }),

      ]).start();  showCloseButton?: boolean;



      if (autoClose && autoClose > 0) {}  visible: boolean;  visible: boolean;

        const timer = setTimeout(() => {

          onClose();

        }, autoClose);

        return () => clearTimeout(timer);export const CustomAlert: React.FC<CustomAlertProps> = ({  onClose: () => void;  onClose: () => void;

      }

    } else {  visible,

      Animated.parallel([

        Animated.timing(scaleAnim, {  onClose,  title: string;  title: string;

          toValue: 0,

          duration: 150,  title,

          useNativeDriver: true,

        }),  message,  message: string;  message: string;

        Animated.timing(opacityAnim, {

          toValue: 0,  type = 'info',

          duration: 150,

          useNativeDriver: true,  primaryButton,  type?: 'success' | 'error' | 'info' | 'warning' | 'celebration' | 'question';  type?: 'success' | 'error' | 'info' | 'warning' | 'celebration' | 'question';

        }),

      ]).start();  secondaryButton,

    }

  }, [visible, scaleAnim, opacityAnim, autoClose, onClose]);  autoClose,  primaryButton?: {  primaryButton?: {



  const getTypeConfig = () => {  showCloseButton = false,

    switch (type) {

      case 'success':}) => {    text: string;    text: string;

        return {

          icon: 'checkmark-circle' as const,  const scaleAnim = React.useRef(new Animated.Value(0)).current;

          iconColor: '#10b981',

          iconBg: '#d1fae5',  const opacityAnim = React.useRef(new Animated.Value(0)).current;    onPress: () => void;    onPress: () => void;

          primaryColor: '#10b981',

        };  const bounceAnim = React.useRef(new Animated.Value(0)).current;

      case 'error':

        return {  };  };

          icon: 'close-circle' as const,

          iconColor: '#ef4444',  React.useEffect(() => {

          iconBg: '#fee2e2',

          primaryColor: '#ef4444',    if (visible) {  secondaryButton?: {  secondaryButton?: {

        };

      case 'warning':      Animated.parallel([

        return {

          icon: 'warning' as const,        Animated.timing(opacityAnim, {    text: string;    text: string;

          iconColor: '#f59e0b',

          iconBg: '#fef3c7',          toValue: 1,

          primaryColor: '#f59e0b',

        };          duration: 200,    onPress: () => void;    onPress: () => void;

      case 'celebration':

        return {          useNativeDriver: true,

          icon: 'sparkles' as const,

          iconColor: '#8b5cf6',        }),  };  };

          iconBg: '#ede9fe',

          primaryColor: '#8b5cf6',        Animated.spring(scaleAnim, {

        };

      default:          toValue: 1,  autoClose?: number; // Auto close after milliseconds  autoClose?: number; // Auto close after milliseconds

        return {

          icon: 'information-circle' as const,          tension: 120,

          iconColor: '#3b82f6',

          iconBg: '#dbeafe',          friction: 8,  showCloseButton?: boolean;  showCloseButton?: boolean;

          primaryColor: '#3b82f6',

        };          useNativeDriver: true,

    }

  };        }),}}



  const config = getTypeConfig();        Animated.spring(bounceAnim, {



  if (!visible) return null;          toValue: 1,



  return (          tension: 200,

    <Modal

      transparent          friction: 6,export const CustomAlert: React.FC<CustomAlertProps> = ({export const CustomAlert: React.FC<CustomAlertProps> = ({

      visible={visible}

      animationType="none"          useNativeDriver: true,

      statusBarTranslucent

      onRequestClose={onClose}        }),  visible,  visible,

    >

      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />      ]).start();

      <Animated.View

        style={{  onClose,  onClose,

          flex: 1,

          backgroundColor: 'rgba(0,0,0,0.5)',      if (autoClose && autoClose > 0) {

          justifyContent: 'center',

          alignItems: 'center',        const timer = setTimeout(() => {  title,  title,

          padding: 20,

          opacity: opacityAnim,          onClose();

        }}

      >        }, autoClose);  message,  message,

        <Animated.View

          style={{        return () => clearTimeout(timer);

            backgroundColor: '#ffffff',

            borderRadius: 24,      }  type = 'info',  type = 'info',

            padding: 24,

            width: width - 60,    } else {

            maxWidth: 400,

            shadowColor: '#000',      Animated.parallel([  primaryButton,  primaryButton,

            shadowOffset: { width: 0, height: 10 },

            shadowOpacity: 0.25,        Animated.timing(scaleAnim, {

            shadowRadius: 20,

            elevation: 10,          toValue: 0,  secondaryButton,  secondaryButton,

            transform: [{ scale: scaleAnim }],

          }}          duration: 150,

        >

          <View style={{ alignItems: 'center', marginBottom: 20 }}>          useNativeDriver: true,  autoClose,  autoClose,

            <View

              style={{        }),

                width: 80,

                height: 80,        Animated.timing(opacityAnim, {  showCloseButton = false,  showCloseButton = false,

                borderRadius: 40,

                backgroundColor: config.iconBg,          toValue: 0,

                justifyContent: 'center',

                alignItems: 'center',          duration: 150,}) => {}) => {

                marginBottom: 16,

              }}          useNativeDriver: true,

            >

              <Ionicons         }),  const scaleAnim = React.useRef(new Animated.Value(0)).current;  const scaleAnim = React.useRef(new Animated.Value(0)).current;

                name={config.icon} 

                size={40}       ]).start();

                color={config.iconColor} 

              />    }  const opacityAnim = React.useRef(new Animated.Value(0)).current;  const opacityAnim = React.useRef(new Animated.Value(0)).current;

            </View>

          </View>  }, [visible, scaleAnim, opacityAnim, bounceAnim, autoClose, onClose]);



          <Text  const bounceAnim = React.useRef(new Animated.Value(0)).current;  const bounceAnim = React.useRef(new Animated.Value(0)).current;

            style={{

              fontSize: 20,  const getTypeConfig = () => {

              fontWeight: 'bold',

              color: '#1f2937',    switch (type) {  const rotateAnim = React.useRef(new Animated.Value(0)).current;  const rotateAnim = React.useRef(new Animated.Value(0)).current;

              textAlign: 'center',

              marginBottom: 12,      case 'success':

              lineHeight: 28,

            }}        return {

          >

            {title}          icon: 'checkmark-circle' as const,

          </Text>

          iconColor: '#10b981',  React.useEffect(() => {  React.useEffect(() => {

          <Text

            style={{          iconBg: '#d1fae5',

              fontSize: 16,

              color: '#6b7280',          primaryColor: '#10b981',    if (visible) {    if (visible) {

              textAlign: 'center',

              marginBottom: 24,        };

              lineHeight: 24,

            }}      case 'error':      // Enhanced animation sequence      // Enhanced animation sequence

          >

            {message}        return {

          </Text>

          icon: 'close-circle' as const,      Animated.sequence([      Animated.sequence([

          <View style={{ gap: 12 }}>

            {primaryButton && (          iconColor: '#ef4444',

              <TouchableOpacity

                onPress={primaryButton.onPress}          iconBg: '#fee2e2',        Animated.parallel([        Animated.parallel([

                style={{

                  backgroundColor: config.primaryColor,          primaryColor: '#ef4444',

                  paddingVertical: 16,

                  paddingHorizontal: 24,        };          Animated.timing(opacityAnim, {          Animated.timing(opacityAnim, {

                  borderRadius: 16,

                  shadowColor: config.primaryColor,      case 'warning':

                  shadowOffset: { width: 0, height: 4 },

                  shadowOpacity: 0.3,        return {            toValue: 1,            toValue: 1,

                  shadowRadius: 8,

                  elevation: 4,          icon: 'warning' as const,

                }}

                activeOpacity={0.8}          iconColor: '#f59e0b',            duration: 200,            duration: 200,

              >

                <Text          iconBg: '#fef3c7',

                  style={{

                    color: '#ffffff',          primaryColor: '#f59e0b',            useNativeDriver: true,            useNativeDriver: true,

                    fontSize: 16,

                    fontWeight: '600',        };

                    textAlign: 'center',

                  }}      case 'celebration':          }),          }),

                >

                  {primaryButton.text}        return {

                </Text>

              </TouchableOpacity>          icon: 'sparkles' as const,          Animated.spring(scaleAnim, {          Animated.spring(scaleAnim, {

            )}

          iconColor: '#8b5cf6',

            {secondaryButton && (

              <TouchableOpacity          iconBg: '#ede9fe',            toValue: 1,            toValue: 1,

                onPress={secondaryButton.onPress}

                style={{          primaryColor: '#8b5cf6',

                  backgroundColor: '#f9fafb',

                  paddingVertical: 16,        };            tension: 120,            tension: 120,

                  paddingHorizontal: 24,

                  borderRadius: 16,      case 'question':

                  borderWidth: 1,

                  borderColor: '#e5e7eb',        return {            friction: 8,            friction: 8,

                }}

                activeOpacity={0.8}          icon: 'help-circle' as const,

              >

                <Text          iconColor: '#06b6d4',            useNativeDriver: true,            useNativeDriver: true,

                  style={{

                    color: '#6b7280',          iconBg: '#cffafe',

                    fontSize: 16,

                    fontWeight: '500',          primaryColor: '#06b6d4',          }),          }),

                    textAlign: 'center',

                  }}        };

                >

                  {secondaryButton.text}      default:        ]),        ]),

                </Text>

              </TouchableOpacity>        return {

            )}

          icon: 'information-circle' as const,        Animated.spring(bounceAnim, {        Animated.spring(bounceAnim, {

            {!primaryButton && !secondaryButton && (

              <TouchableOpacity          iconColor: '#3b82f6',

                onPress={onClose}

                style={{          iconBg: '#dbeafe',          toValue: 1,          toValue: 1,

                  backgroundColor: config.primaryColor,

                  paddingVertical: 16,          primaryColor: '#3b82f6',

                  paddingHorizontal: 24,

                  borderRadius: 16,        };          tension: 200,          tension: 200,

                  shadowColor: config.primaryColor,

                  shadowOffset: { width: 0, height: 4 },    }

                  shadowOpacity: 0.3,

                  shadowRadius: 8,  };          friction: 6,          friction: 6,

                  elevation: 4,

                }}

                activeOpacity={0.8}

              >  const config = getTypeConfig();          useNativeDriver: true,          useNativeDriver: true,

                <Text

                  style={{

                    color: '#ffffff',

                    fontSize: 16,  if (!visible) return null;        }),        }),

                    fontWeight: '600',

                    textAlign: 'center',

                  }}

                >  return (        ...(type === 'celebration' ? [        ...(type === 'celebration' ? [

                  OK

                </Text>    <Modal

              </TouchableOpacity>

            )}      transparent          Animated.loop(          Animated.loop(

          </View>

        </Animated.View>      visible={visible}

      </Animated.View>

    </Modal>      animationType="none"            Animated.sequence([            Animated.sequence([

  );

};      statusBarTranslucent



export const useCustomAlert = () => {      onRequestClose={onClose}              Animated.timing(rotateAnim, {              Animated.timing(rotateAnim, {

  const [alertConfig, setAlertConfig] = React.useState<{

    visible: boolean;    >

    title: string;

    message: string;      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />                toValue: 1,                toValue: 1,

    type: 'success' | 'error' | 'info' | 'warning' | 'celebration';

    primaryButton?: { text: string; onPress: () => void };      <Animated.View

    secondaryButton?: { text: string; onPress: () => void };

    autoClose?: number;        style={{                duration: 2000,                duration: 2000,

  }>({

    visible: false,          flex: 1,

    title: '',

    message: '',          backgroundColor: 'rgba(0,0,0,0.5)',                useNativeDriver: true,                useNativeDriver: true,

    type: 'info',

  });          justifyContent: 'center',



  const showAlert = React.useCallback((config: Omit<typeof alertConfig, 'visible'>) => {          alignItems: 'center',              }),              }),

    setAlertConfig({ ...config, visible: true });

  }, []);          padding: 20,



  const hideAlert = React.useCallback(() => {          opacity: opacityAnim,              Animated.timing(rotateAnim, {              Animated.timing(rotateAnim, {

    setAlertConfig(prev => ({ ...prev, visible: false }));

  }, []);        }}



  const showSuccess = React.useCallback((title: string, message: string, autoClose?: number) => {      >                toValue: 0,                toValue: 0,

    showAlert({ 

      title,         <Animated.View

      message, 

      type: 'success',           style={{                duration: 0,                duration: 0,

      autoClose: autoClose || 3000 

    });            backgroundColor: '#ffffff',

  }, [showAlert]);

            borderRadius: 28,                useNativeDriver: true,                useNativeDriver: true,

  const showError = React.useCallback((title: string, message: string) => {

    showAlert({ title, message, type: 'error' });            padding: 28,

  }, [showAlert]);

            width: width - 60,              }),              }),

  const showCelebration = React.useCallback((title: string, message: string, autoClose?: number) => {

    showAlert({             maxWidth: 420,

      title, 

      message,             shadowColor: '#000',            ]),            ]),

      type: 'celebration', 

      autoClose: autoClose || 4000             shadowOffset: { width: 0, height: 15 },

    });

  }, [showAlert]);            shadowOpacity: 0.3,            { iterations: 3 }            { iterations: 3 }



  const showConfirmation = React.useCallback((            shadowRadius: 25,

    title: string, 

    message: string,             elevation: 15,          ),          ),

    onConfirm: () => void, 

    confirmText = 'Yes',             transform: [{ scale: scaleAnim }],

    cancelText = 'No'

  ) => {            borderWidth: 3,        ] : []),        ] : []),

    showAlert({

      title,            borderColor: config.iconBg,

      message,

      type: 'warning',          }}      ]).start();      ]).start();

      primaryButton: {

        text: confirmText,        >

        onPress: () => {

          hideAlert();          {showCloseButton && (

          onConfirm();

        },            <TouchableOpacity

      },

      secondaryButton: {              onPress={onClose}      // Auto close functionality      // Auto close functionality

        text: cancelText,

        onPress: hideAlert,              style={{

      },

    });                position: 'absolute',      if (autoClose && autoClose > 0) {      if (autoClose && autoClose > 0) {

  }, [showAlert, hideAlert]);

                top: 15,

  const AlertComponent = React.useCallback(

    () => (                right: 15,        const timer = setTimeout(() => {        const timer = setTimeout(() => {

      <CustomAlert

        {...alertConfig}                backgroundColor: '#f3f4f6',

        onClose={hideAlert}

      />                borderRadius: 20,          onClose();          onClose();

    ),

    [alertConfig, hideAlert]                padding: 8,

  );

                zIndex: 1,        }, autoClose);  const getTypeConfig = () => {

  return {

    showAlert,              }}

    hideAlert,

    showSuccess,              activeOpacity={0.7}        return () => clearTimeout(timer);    switch (type) {

    showError,

    showCelebration,            >

    showConfirmation,

    AlertComponent,              <Ionicons name="close" size={18} color="#6b7280" />      }      case 'success':

  };

};            </TouchableOpacity>

          )}    } else {        return {



          <View style={{ alignItems: 'center', marginBottom: 24 }}>      Animated.parallel([          icon: 'checkmark-circle' as const,

            <Animated.View

              style={{        Animated.timing(scaleAnim, {          iconColor: '#10b981',

                width: 100,

                height: 100,          toValue: 0,          iconBg: '#d1fae5',

                borderRadius: 50,

                backgroundColor: config.iconBg,          duration: 150,          primaryColor: '#10b981',

                justifyContent: 'center',

                alignItems: 'center',          useNativeDriver: true,          gradient: ['#d1fae5', '#ecfdf5'],

                marginBottom: 20,

                borderWidth: 3,        }),          iconSize: 40,

                borderColor: config.iconColor + '20',

                transform: [{        Animated.timing(opacityAnim, {        };

                  scale: bounceAnim.interpolate({

                    inputRange: [0, 1],          toValue: 0,      case 'error':

                    outputRange: [0.8, 1.1],

                  }),          duration: 150,        return {

                }],

              }}          useNativeDriver: true,          icon: 'close-circle' as const,

            >

              <Ionicons         }),          iconColor: '#ef4444',

                name={config.icon} 

                size={40}       ]).start();          iconBg: '#fee2e2',

                color={config.iconColor} 

              />    }          primaryColor: '#ef4444',

            </Animated.View>

          </View>  }, [visible, scaleAnim, opacityAnim, bounceAnim, rotateAnim, autoClose, onClose, type]);          gradient: ['#fee2e2', '#fef2f2'],



          <Text          iconSize: 40,

            style={{

              fontSize: 22,  const getTypeConfig = () => {        };

              fontWeight: 'bold',

              color: '#1f2937',    switch (type) {      case 'warning':

              textAlign: 'center',

              marginBottom: 16,      case 'success':        return {

              lineHeight: 30,

            }}        return {          icon: 'warning' as const,

          >

            {title}          icon: 'checkmark-circle' as const,          iconColor: '#f59e0b',

          </Text>

          iconColor: '#10b981',          iconBg: '#fef3c7',

          <Text

            style={{          iconBg: '#d1fae5',          primaryColor: '#f59e0b',

              fontSize: 16,

              color: '#6b7280',          primaryColor: '#10b981',          gradient: ['#fef3c7', '#fffbeb'],

              textAlign: 'center',

              marginBottom: 28,          iconSize: 40,          iconSize: 40,

              lineHeight: 24,

              paddingHorizontal: 8,        };        };

            }}

          >      case 'error':      case 'celebration':

            {message}

          </Text>        return {        return {



          <View style={{ gap: 14 }}>          icon: 'close-circle' as const,          icon: 'sparkles' as const,

            {primaryButton && (

              <TouchableOpacity          iconColor: '#ef4444',          iconColor: '#8b5cf6',

                onPress={primaryButton.onPress}

                style={{          iconBg: '#fee2e2',          iconBg: '#ede9fe',

                  backgroundColor: config.primaryColor,

                  paddingVertical: 18,          primaryColor: '#ef4444',          primaryColor: '#8b5cf6',

                  paddingHorizontal: 28,

                  borderRadius: 18,          iconSize: 40,          gradient: ['#ede9fe', '#f5f3ff'],

                  shadowColor: config.primaryColor,

                  shadowOffset: { width: 0, height: 6 },        };          iconSize: 45,

                  shadowOpacity: 0.4,

                  shadowRadius: 12,      case 'warning':        };

                  elevation: 6,

                }}        return {      case 'question':

                activeOpacity={0.8}

              >          icon: 'warning' as const,        return {

                <Text

                  style={{          iconColor: '#f59e0b',          icon: 'help-circle' as const,

                    color: '#ffffff',

                    fontSize: 17,          iconBg: '#fef3c7',          iconColor: '#06b6d4',

                    fontWeight: '700',

                    textAlign: 'center',          primaryColor: '#f59e0b',          iconBg: '#cffafe',

                    letterSpacing: 0.5,

                  }}          iconSize: 40,          primaryColor: '#06b6d4',

                >

                  {primaryButton.text}        };          gradient: ['#cffafe', '#ecfeff'],

                </Text>

              </TouchableOpacity>      case 'celebration':          iconSize: 40,

            )}

        return {        };

            {secondaryButton && (

              <TouchableOpacity          icon: 'sparkles' as const,      default:

                onPress={secondaryButton.onPress}

                style={{          iconColor: '#8b5cf6',        return {

                  backgroundColor: '#f9fafb',

                  paddingVertical: 18,          iconBg: '#ede9fe',          icon: 'information-circle' as const,

                  paddingHorizontal: 28,

                  borderRadius: 18,          primaryColor: '#8b5cf6',          iconColor: '#3b82f6',

                  borderWidth: 2,

                  borderColor: '#e5e7eb',          iconSize: 45,          iconBg: '#dbeafe',

                }}

                activeOpacity={0.8}        };          primaryColor: '#3b82f6',

              >

                <Text      case 'question':          gradient: ['#dbeafe', '#eff6ff'],

                  style={{

                    color: '#6b7280',        return {          iconSize: 40,

                    fontSize: 17,

                    fontWeight: '600',          icon: 'help-circle' as const,        };

                    textAlign: 'center',

                    letterSpacing: 0.5,          iconColor: '#06b6d4',    }

                  }}

                >          iconBg: '#cffafe',  };

                  {secondaryButton.text}

                </Text>          primaryColor: '#06b6d4',

              </TouchableOpacity>

            )}          iconSize: 40,  const config = getTypeConfig();



            {!primaryButton && !secondaryButton && (        };

              <TouchableOpacity

                onPress={onClose}      default:  const getIconTransform = () => {

                style={{

                  backgroundColor: config.primaryColor,        return {    if (type === 'celebration') {

                  paddingVertical: 18,

                  paddingHorizontal: 28,          icon: 'information-circle' as const,      return {

                  borderRadius: 18,

                  shadowColor: config.primaryColor,          iconColor: '#3b82f6',        transform: [

                  shadowOffset: { width: 0, height: 6 },

                  shadowOpacity: 0.4,          iconBg: '#dbeafe',          {

                  shadowRadius: 12,

                  elevation: 6,          primaryColor: '#3b82f6',            rotate: rotateAnim.interpolate({

                }}

                activeOpacity={0.8}          iconSize: 40,              inputRange: [0, 1],

              >

                <Text        };              outputRange: ['0deg', '360deg'],

                  style={{

                    color: '#ffffff',    }            }),

                    fontSize: 17,

                    fontWeight: '700',  };          },

                    textAlign: 'center',

                    letterSpacing: 0.5,          {

                  }}

                >  const config = getTypeConfig();            scale: bounceAnim.interpolate({

                  OK

                </Text>              inputRange: [0, 1],

              </TouchableOpacity>

            )}  const getIconTransform = () => {              outputRange: [0.8, 1.2],

          </View>

        </Animated.View>    if (type === 'celebration') {            }),

      </Animated.View>

    </Modal>      return {          },

  );

};        transform: [        ],



export const useCustomAlert = () => {          {      };

  const [alertConfig, setAlertConfig] = React.useState<{

    visible: boolean;            rotate: rotateAnim.interpolate({    }

    title: string;

    message: string;              inputRange: [0, 1],    return {

    type: 'success' | 'error' | 'info' | 'warning' | 'celebration' | 'question';

    primaryButton?: { text: string; onPress: () => void };              outputRange: ['0deg', '360deg'],      transform: [

    secondaryButton?: { text: string; onPress: () => void };

    autoClose?: number;            }),        {

    showCloseButton?: boolean;

  }>({          },          scale: bounceAnim.interpolate({

    visible: false,

    title: '',          {            inputRange: [0, 1],

    message: '',

    type: 'info',            scale: bounceAnim.interpolate({            outputRange: [0.8, 1.1],

  });

              inputRange: [0, 1],          }),

  const showAlert = React.useCallback((config: Omit<typeof alertConfig, 'visible'>) => {

    setAlertConfig({ ...config, visible: true });              outputRange: [0.8, 1.2],        },

  }, []);

            }),      ],

  const hideAlert = React.useCallback(() => {

    setAlertConfig(prev => ({ ...prev, visible: false }));          },    };

  }, []);

        ],  };

  const showSuccess = React.useCallback((title: string, message: string, autoClose?: number) => {

    showAlert({       };

      title, 

      message,     }  if (!visible) return null;

      type: 'success', 

      autoClose: autoClose || 3000     return {

    });

  }, [showAlert]);      transform: [  return (



  const showError = React.useCallback((title: string, message: string) => {        {    <Modal

    showAlert({ title, message, type: 'error' });

  }, [showAlert]);          scale: bounceAnim.interpolate({      transparent



  const showWarning = React.useCallback((title: string, message: string) => {            inputRange: [0, 1],      visible={visible}

    showAlert({ title, message, type: 'warning' });

  }, [showAlert]);            outputRange: [0.8, 1.1],      animationType="none"



  const showInfo = React.useCallback((title: string, message: string, autoClose?: number) => {          }),      statusBarTranslucent

    showAlert({ 

      title,         },      onRequestClose={onClose}

      message, 

      type: 'info',       ],    >

      autoClose 

    });    };      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

  }, [showAlert]);

  };      <Animated.View

  const showCelebration = React.useCallback((title: string, message: string, autoClose?: number) => {

    showAlert({         style={{

      title, 

      message,   if (!visible) return null;          flex: 1,

      type: 'celebration', 

      autoClose: autoClose || 4000           backgroundColor: 'rgba(0,0,0,0.5)',

    });

  }, [showAlert]);  return (          justifyContent: 'center',



  const showConfirmation = React.useCallback((    <Modal          alignItems: 'center',

    title: string, 

    message: string,       transparent          padding: 20,

    onConfirm: () => void, 

    confirmText = 'Yes',       visible={visible}          opacity: opacityAnim,

    cancelText = 'No'

  ) => {      animationType="none"        }}

    showAlert({

      title,      statusBarTranslucent      >

      message,

      type: 'question',      onRequestClose={onClose}        <Animated.View

      primaryButton: {

        text: confirmText,    >          style={{

        onPress: () => {

          hideAlert();      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />            backgroundColor: '#ffffff',

          onConfirm();

        },      <Animated.View            borderRadius: 28,

      },

      secondaryButton: {        style={{            padding: 28,

        text: cancelText,

        onPress: hideAlert,          flex: 1,            width: width - 60,

      },

    });          backgroundColor: 'rgba(0,0,0,0.5)',            maxWidth: 420,

  }, [showAlert, hideAlert]);

          justifyContent: 'center',            shadowColor: '#000',

  const AlertComponent = React.useCallback(

    () => (          alignItems: 'center',            shadowOffset: { width: 0, height: 15 },

      <CustomAlert

        {...alertConfig}          padding: 20,            shadowOpacity: 0.3,

        onClose={hideAlert}

      />          opacity: opacityAnim,            shadowRadius: 25,

    ),

    [alertConfig, hideAlert]        }}            elevation: 15,

  );

      >            transform: [{ scale: scaleAnim }],

  return {

    showAlert,        <Animated.View            borderWidth: 3,

    hideAlert,

    showSuccess,          style={{            borderColor: config.iconBg,

    showError,

    showWarning,            backgroundColor: '#ffffff',          }}

    showInfo,

    showCelebration,            borderRadius: 28,        >

    showConfirmation,

    AlertComponent,            padding: 28,          {/* Close Button */}

  };

};            width: width - 60,          {showCloseButton && (

            maxWidth: 420,            <TouchableOpacity

            shadowColor: '#000',              onPress={onClose}

            shadowOffset: { width: 0, height: 15 },              style={{

            shadowOpacity: 0.3,                position: 'absolute',

            shadowRadius: 25,                top: 15,

            elevation: 15,                right: 15,

            transform: [{ scale: scaleAnim }],                backgroundColor: '#f3f4f6',

            borderWidth: 3,                borderRadius: 20,

            borderColor: config.iconBg,                padding: 8,

          }}                zIndex: 1,

        >              }}

          {/* Close Button */}              activeOpacity={0.7}

          {showCloseButton && (            >

            <TouchableOpacity              <Ionicons name="close" size={18} color="#6b7280" />

              onPress={onClose}            </TouchableOpacity>

              style={{          )}

                position: 'absolute',

                top: 15,          {/* Icon */}

                right: 15,          <View style={{ alignItems: 'center', marginBottom: 24 }}>

                backgroundColor: '#f3f4f6',            <Animated.View

                borderRadius: 20,              style={[

                padding: 8,                {

                zIndex: 1,                  width: 100,

              }}                  height: 100,

              activeOpacity={0.7}                  borderRadius: 50,

            >                  backgroundColor: config.iconBg,

              <Ionicons name="close" size={18} color="#6b7280" />                  justifyContent: 'center',

            </TouchableOpacity>                  alignItems: 'center',

          )}                  marginBottom: 20,

                  borderWidth: 3,

          {/* Icon */}                  borderColor: config.iconColor + '20',

          <View style={{ alignItems: 'center', marginBottom: 24 }}>                },

            <Animated.View                getIconTransform(),

              style={[              ]}

                {            >

                  width: 100,              <Ionicons 

                  height: 100,                name={config.icon} 

                  borderRadius: 50,                size={config.iconSize} 

                  backgroundColor: config.iconBg,                color={config.iconColor} 

                  justifyContent: 'center',              />

                  alignItems: 'center',            </Animated.View>

                  marginBottom: 20,          </View>

                  borderWidth: 3,

                  borderColor: config.iconColor + '20',          {/* Title */}

                },          <Text

                getIconTransform(),            style={{

              ]}              fontSize: 22,

            >              fontWeight: 'bold',

              <Ionicons               color: '#1f2937',

                name={config.icon}               textAlign: 'center',

                size={config.iconSize}               marginBottom: 16,

                color={config.iconColor}               lineHeight: 30,

              />            }}

            </Animated.View>          >

          </View>            {title}

          </Text>

          {/* Title */}

          <Text          {/* Message */}

            style={{          <Text

              fontSize: 22,            style={{

              fontWeight: 'bold',              fontSize: 16,

              color: '#1f2937',              color: '#6b7280',

              textAlign: 'center',              textAlign: 'center',

              marginBottom: 16,              marginBottom: 28,

              lineHeight: 30,              lineHeight: 24,

            }}              paddingHorizontal: 8,

          >            }}

            {title}          >

          </Text>            {message}

          </Text>

          {/* Message */}

          <Text          {/* Buttons */}

            style={{          <View style={{ gap: 14 }}>

              fontSize: 16,            {primaryButton && (

              color: '#6b7280',              <TouchableOpacity

              textAlign: 'center',                onPress={primaryButton.onPress}

              marginBottom: 28,                style={{

              lineHeight: 24,                  backgroundColor: config.primaryColor,

              paddingHorizontal: 8,                  paddingVertical: 18,

            }}                  paddingHorizontal: 28,

          >                  borderRadius: 18,

            {message}                  shadowColor: config.primaryColor,

          </Text>                  shadowOffset: { width: 0, height: 6 },

                  shadowOpacity: 0.4,

          {/* Buttons */}                  shadowRadius: 12,

          <View style={{ gap: 14 }}>                  elevation: 6,

            {primaryButton && (                }}

              <TouchableOpacity                activeOpacity={0.8}

                onPress={primaryButton.onPress}              >

                style={{                <Text

                  backgroundColor: config.primaryColor,                  style={{

                  paddingVertical: 18,                    color: '#ffffff',

                  paddingHorizontal: 28,                    fontSize: 17,

                  borderRadius: 18,                    fontWeight: '700',

                  shadowColor: config.primaryColor,                    textAlign: 'center',

                  shadowOffset: { width: 0, height: 6 },                    letterSpacing: 0.5,

                  shadowOpacity: 0.4,                  }}

                  shadowRadius: 12,                >

                  elevation: 6,                  {primaryButton.text}

                }}                </Text>

                activeOpacity={0.8}              </TouchableOpacity>

              >            )}

                <Text

                  style={{            {secondaryButton && (

                    color: '#ffffff',              <TouchableOpacity

                    fontSize: 17,                onPress={secondaryButton.onPress}

                    fontWeight: '700',                style={{

                    textAlign: 'center',                  backgroundColor: '#f9fafb',

                    letterSpacing: 0.5,                  paddingVertical: 18,

                  }}                  paddingHorizontal: 28,

                >                  borderRadius: 18,

                  {primaryButton.text}                  borderWidth: 2,

                </Text>                  borderColor: '#e5e7eb',

              </TouchableOpacity>                }}

            )}                activeOpacity={0.8}

              >

            {secondaryButton && (                <Text

              <TouchableOpacity                  style={{

                onPress={secondaryButton.onPress}                    color: '#6b7280',

                style={{                    fontSize: 17,

                  backgroundColor: '#f9fafb',                    fontWeight: '600',

                  paddingVertical: 18,                    textAlign: 'center',

                  paddingHorizontal: 28,                    letterSpacing: 0.5,

                  borderRadius: 18,                  }}

                  borderWidth: 2,                >

                  borderColor: '#e5e7eb',                  {secondaryButton.text}

                }}                </Text>

                activeOpacity={0.8}              </TouchableOpacity>

              >            )}

                <Text

                  style={{            {!primaryButton && !secondaryButton && (

                    color: '#6b7280',              <TouchableOpacity

                    fontSize: 17,                onPress={onClose}

                    fontWeight: '600',                style={{

                    textAlign: 'center',                  backgroundColor: config.primaryColor,

                    letterSpacing: 0.5,                  paddingVertical: 18,

                  }}                  paddingHorizontal: 28,

                >                  borderRadius: 18,

                  {secondaryButton.text}                  shadowColor: config.primaryColor,

                </Text>                  shadowOffset: { width: 0, height: 6 },

              </TouchableOpacity>                  shadowOpacity: 0.4,

            )}                  shadowRadius: 12,

                  elevation: 6,

            {!primaryButton && !secondaryButton && (                }}

              <TouchableOpacity                activeOpacity={0.8}

                onPress={onClose}              >

                style={{                <Text

                  backgroundColor: config.primaryColor,                  style={{

                  paddingVertical: 18,                    color: '#ffffff',

                  paddingHorizontal: 28,                    fontSize: 17,

                  borderRadius: 18,                    fontWeight: '700',

                  shadowColor: config.primaryColor,                    textAlign: 'center',

                  shadowOffset: { width: 0, height: 6 },                    letterSpacing: 0.5,

                  shadowOpacity: 0.4,                  }}

                  shadowRadius: 12,                >

                  elevation: 6,                  OK

                }}                </Text>

                activeOpacity={0.8}              </TouchableOpacity>

              >            )}

                <Text          </View>

                  style={{        </Animated.View>

                    color: '#ffffff',      </Animated.View>

                    fontSize: 17,    </Modal>

                    fontWeight: '700',  );

                    textAlign: 'center',};

                    letterSpacing: 0.5,          primaryColor: '#ef4444',

                  }}          gradient: ['#fee2e2', '#fef2f2'],

                >        };

                  OK      case 'warning':

                </Text>        return {

              </TouchableOpacity>          icon: 'warning' as const,

            )}          iconColor: '#f59e0b',

          </View>          iconBg: '#fef3c7',

        </Animated.View>          primaryColor: '#f59e0b',

      </Animated.View>          gradient: ['#fef3c7', '#fffbeb'],

    </Modal>        };

  );      default:

};        return {

          icon: 'information-circle' as const,

// Hook for easier usage          iconColor: '#3b82f6',

export const useCustomAlert = () => {          iconBg: '#dbeafe',

  const [alertConfig, setAlertConfig] = React.useState<{          primaryColor: '#3b82f6',

    visible: boolean;          gradient: ['#dbeafe', '#eff6ff'],

    title: string;        };

    message: string;    }

    type: 'success' | 'error' | 'info' | 'warning' | 'celebration' | 'question';  };

    primaryButton?: { text: string; onPress: () => void };

    secondaryButton?: { text: string; onPress: () => void };  const config = getTypeConfig();

    autoClose?: number;

    showCloseButton?: boolean;  if (!visible) return null;

  }>({

    visible: false,  return (

    title: '',    <Modal

    message: '',      transparent

    type: 'info',      visible={visible}

  });      animationType="none"

      statusBarTranslucent

  const showAlert = React.useCallback((config: Omit<typeof alertConfig, 'visible'>) => {      onRequestClose={onClose}

    setAlertConfig({ ...config, visible: true });    >

  }, []);      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      <Animated.View

  const hideAlert = React.useCallback(() => {        style={{

    setAlertConfig(prev => ({ ...prev, visible: false }));          flex: 1,

  }, []);          backgroundColor: 'rgba(0,0,0,0.5)',

          justifyContent: 'center',

  const showSuccess = React.useCallback((title: string, message: string, autoClose?: number) => {          alignItems: 'center',

    showAlert({           padding: 20,

      title,           opacity: opacityAnim,

      message,         }}

      type: 'success',       >

      autoClose: autoClose || 3000         <Animated.View

    });          style={{

  }, [showAlert]);            backgroundColor: '#ffffff',

            borderRadius: 24,

  const showError = React.useCallback((title: string, message: string) => {            padding: 24,

    showAlert({ title, message, type: 'error' });            width: width - 60,

  }, [showAlert]);            maxWidth: 400,

            shadowColor: '#000',

  const showWarning = React.useCallback((title: string, message: string) => {            shadowOffset: { width: 0, height: 10 },

    showAlert({ title, message, type: 'warning' });            shadowOpacity: 0.25,

  }, [showAlert]);            shadowRadius: 20,

            elevation: 10,

  const showInfo = React.useCallback((title: string, message: string, autoClose?: number) => {            transform: [{ scale: scaleAnim }],

    showAlert({           }}

      title,         >

      message,           {/* Icon */}

      type: 'info',           <View style={{ alignItems: 'center', marginBottom: 20 }}>

      autoClose             <View

    });              style={{

  }, [showAlert]);                width: 80,

                height: 80,

  const showCelebration = React.useCallback((title: string, message: string, autoClose?: number) => {                borderRadius: 40,

    showAlert({                 backgroundColor: config.iconBg,

      title,                 justifyContent: 'center',

      message,                 alignItems: 'center',

      type: 'celebration',                 marginBottom: 16,

      autoClose: autoClose || 4000               }}

    });            >

  }, [showAlert]);              <Ionicons 

                name={config.icon} 

  const showConfirmation = React.useCallback((                size={40} 

    title: string,                 color={config.iconColor} 

    message: string,               />

    onConfirm: () => void,             </View>

    confirmText = 'Yes',           </View>

    cancelText = 'No'

  ) => {          {/* Title */}

    showAlert({          <Text

      title,            style={{

      message,              fontSize: 20,

      type: 'question',              fontWeight: 'bold',

      primaryButton: {              color: '#1f2937',

        text: confirmText,              textAlign: 'center',

        onPress: () => {              marginBottom: 12,

          hideAlert();              lineHeight: 28,

          onConfirm();            }}

        },          >

      },            {title}

      secondaryButton: {          </Text>

        text: cancelText,

        onPress: hideAlert,          {/* Message */}

      },          <Text

    });            style={{

  }, [showAlert, hideAlert]);              fontSize: 16,

              color: '#6b7280',

  const AlertComponent = React.useCallback(              textAlign: 'center',

    () => (              marginBottom: 24,

      <CustomAlert              lineHeight: 24,

        {...alertConfig}            }}

        onClose={hideAlert}          >

      />            {message}

    ),          </Text>

    [alertConfig, hideAlert]

  );          {/* Buttons */}

          <View style={{ gap: 12 }}>

  return {            {primaryButton && (

    showAlert,              <TouchableOpacity

    hideAlert,                onPress={primaryButton.onPress}

    showSuccess,                style={{

    showError,                  backgroundColor: config.primaryColor,

    showWarning,                  paddingVertical: 16,

    showInfo,                  paddingHorizontal: 24,

    showCelebration,                  borderRadius: 16,

    showConfirmation,                  shadowColor: config.primaryColor,

    AlertComponent,                  shadowOffset: { width: 0, height: 4 },

  };                  shadowOpacity: 0.3,

};                  shadowRadius: 8,
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
                  {primaryButton.text}
                </Text>
              </TouchableOpacity>
            )}

            {secondaryButton && (
              <TouchableOpacity
                onPress={secondaryButton.onPress}
                style={{
                  backgroundColor: '#f9fafb',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: '#6b7280',
                    fontSize: 16,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {secondaryButton.text}
                </Text>
              </TouchableOpacity>
            )}

            {!primaryButton && !secondaryButton && (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: config.primaryColor,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  shadowColor: config.primaryColor,
                  shadowOffset: { width: 0, height: 4 },
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

// Hook for easier usage
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    primaryButton?: { text: string; onPress: () => void };
    secondaryButton?: { text: string; onPress: () => void };
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = React.useCallback((config: Omit<typeof alertConfig, 'visible'>) => {
    setAlertConfig({ ...config, visible: true });
  }, []);

  const hideAlert = React.useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const AlertComponent = React.useCallback(
    () => (
      <CustomAlert
        {...alertConfig}
        onClose={hideAlert}
      />
    ),
    [alertConfig, hideAlert]
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};