import * as React from "react";
import { Stack } from "expo-router";
import "../global.css";
import { UserProvider } from "../context/UserContext"; 

const Layout: React.FC = () => {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
};

export default Layout;
