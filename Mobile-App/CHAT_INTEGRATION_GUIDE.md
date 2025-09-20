# Chat Integration Guide for Recycle IT

## Current Implementation ✅
- Simple text-based chat interface 
- Clean Material Design styling
- Fully functional in React Native
- Fallback support messages

## To Upgrade to Full Botpress WebView Integration:

### Step 1: Install WebView Package
```bash
cd Mobile-App
npm install react-native-webview
```

### Step 2: Update chat.tsx
Replace the current chat.tsx content with:

```tsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

const ChatScreen = () => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Chat Support</title>
      <script src="https://cdn.botpress.cloud/webchat/v3.2/inject.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8f9fa;
        }
        #webchat {
          width: 100%;
          height: 100vh;
        }
        #webchat .bpWebchat {
          position: unset;
          width: 100%;
          height: 100%;
          max-height: 100%;
          max-width: 100%;
          border: none;
          border-radius: 0;
        }
        #webchat .bpFab {
          display: none;
        }
        .header {
          background-color: #10b981;
          color: white;
          padding: 16px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="header">Recycle IT Support Chat</div>
      <div id="webchat"></div>
      
      <script>
        window.botpress.on("webchat:ready", () => {
          window.botpress.open();
        });
        window.botpress.init({
          "botId": "fa53ccf3-26ef-4371-aa5f-be6fb425fccd",
          "configuration": {
            "version": "v2",
            "website": {},
            "email": {},
            "phone": {},
            "termsOfService": {},
            "privacyPolicy": {},
            "color": "#10b981",
            "variant": "solid",
            "headerVariant": "glass",
            "themeMode": "light",
            "fontFamily": "inter",
            "radius": 4,
            "feedbackEnabled": false,
            "footer": "[⚡ by Botpress](https://botpress.com/?from=webchat)",
            "soundEnabled": false
          },
          "clientId": "09fd91fc-b124-45b1-9f8c-a2de8379109b",
          "selector": "#webchat"
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Loading chat...</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ChatScreen;
```

### Step 3: For iOS (if using)
Add to ios/Podfile:
```ruby
pod 'react-native-webview', :path => '../node_modules/react-native-webview'
```

Then run:
```bash
cd ios && pod install
```

### Step 4: Test
Your Botpress chat will now work fully integrated in the mobile app!

## Features Included:
- ✅ Chat tab in bottom navigation
- ✅ Botpress webchat integration (when WebView installed)
- ✅ Fallback simple chat interface
- ✅ Consistent app styling
- ✅ Full mobile optimization
- ✅ Error handling

## Notes:
- The chat tab is already added to your navigation
- Simple chat works immediately without any additional setup
- WebView integration requires package installation
- Colors match your app theme (#10b981 green)