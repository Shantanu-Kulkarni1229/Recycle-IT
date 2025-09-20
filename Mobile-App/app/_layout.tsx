import * as React from "react";
import { Stack } from "expo-router";
import "../global.css";
import { UserProvider } from "../context/UserContext"; 
import { AlertProvider } from "../components/CustomAlert";

const Layout: React.FC = () => {
  return (
    <UserProvider>
      <AlertProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AlertProvider>
    </UserProvider>
  );
};

export default Layout;
