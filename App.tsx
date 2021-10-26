import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, StyleSheet, Text, View, SafeAreaView } from "react-native";

import AuthComposition from "./components/AuthComposition";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import NetworkComposition from "./components/NetworkComposition";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import { SairaStencilOne_400Regular } from "@expo-google-fonts/saira-stencil-one";
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  enableNative: false,
  dsn: "",
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const cacheLoaded = useCachedResources();
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    SairaStencilOne_400Regular,
  });

  const colorScheme = useColorScheme();
  const [notification, setNotification] =
    useState<Notifications.Notification>();

  useEffect(() => {
    Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });
  }, []);

  if (!cacheLoaded || !fontsLoaded) {
    return null;
  } else {
    return (
      <>
        <AuthComposition>
          <NetworkComposition>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c1e" }}>
              <Navigation colorScheme={colorScheme} />
              <StatusBar />
            </SafeAreaView>
          </NetworkComposition>
        </AuthComposition>
      </>
    );
  }
};

export default Sentry.wrap(App);
