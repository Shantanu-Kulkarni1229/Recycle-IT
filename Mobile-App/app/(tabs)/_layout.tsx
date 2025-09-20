import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Text,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// 🔑 Keep your key in app config / .env  → EXPO_PUBLIC_GEMINI_KEY
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY || "";

function AiAssistant() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ API key not found. Please check your .env file." },
      ]);
      return;
    }
    
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      console.log("🔄 Sending request to Gemini API...");
      console.log("API Key present:", !!GEMINI_API_KEY);
      console.log("User message:", userMsg.content);
      
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userMsg.content }] }],
          }),
        }
      );
      
      console.log("📊 Response status:", res.status);
      console.log("📊 Response ok:", res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API Error response:", errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log("📦 Response data:", JSON.stringify(data, null, 2));
      
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn’t understand.";
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("🚨 Full error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat bubble */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          setVisible(true);
          // Add welcome message if chat is empty
          if (messages.length === 0) {
            setMessages([{
              role: "assistant", 
              content: `👋 Hello! I'm your AI assistant. ${GEMINI_API_KEY ? '✅ API is ready!' : '❌ No API key found'}\n\nHow can I help you today?`
            }]);
          }
        }}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Chat modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.chatBox}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
              {messages.map((m, i) => (
                <Text
                  key={i}
                  style={{
                    marginVertical: 4,
                    color: m.role === "user" ? "#10b981" : "#374151",
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>
                    {m.role === "user" ? "You: " : "AI: "}
                  </Text>
                  {m.content}
                </Text>
              ))}
              {loading && <ActivityIndicator style={{ marginVertical: 8 }} />}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask me anything…"
                style={styles.input}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            height: Platform.OS === "ios" ? 90 : 70,
            paddingBottom: Platform.OS === "ios" ? 25 : 10,
            paddingTop: 10,
            paddingHorizontal: 8,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            position: "absolute",
          },
          tabBarActiveTintColor: "#10b981",
          tabBarInactiveTintColor: "#6b7280",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 2,
            letterSpacing: 0.3,
          },
          tabBarIconStyle: { marginBottom: -2 },
          tabBarHideOnKeyboard: true,
          tabBarItemStyle: {
            paddingVertical: 4,
            borderRadius: 16,
            marginHorizontal: 2,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="previous-history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "time" : "time-outline"}
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="recyclers-nearby"
          options={{
            title: "recyclers-nearby",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "location" : "location-outline"}
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: "Learn",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      {/* 🔵 Floating AI assistant visible on all tabs */}
      <AiAssistant />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    backgroundColor: "#10b981",
    borderRadius: 30,
    padding: 14,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatBox: {
    width: "90%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ef4444",
    padding: 6,
    borderRadius: 16,
  },
});
