import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import Appearance from "../components/Appearance";
import NotificationSettings from "../components/NotificationSettings";
import { CustomTheme, SuperContestThemeColors } from "../types/types";
import UserInfo from "../components/UserInfo";
import LeagueManager from "../components/LeagueManager";
import Logout from "../components/Logout";

export default function User() {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container}>
          <UserInfo />
          <NotificationSettings />
          <Appearance />
          <LeagueManager />
          <Logout />
          <View style={styles.spacer}></View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 10,
    },
    spacer: {
      height: 50,
    },
  });
};
