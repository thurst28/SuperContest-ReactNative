import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CustomTheme, SuperContestThemeColors } from "../types/types";
import { AuthContext } from "./AuthComposition";

import { StyledText } from "./StyledText";

export const THEME_STORAGE_KEY = "THEME";

export default function AppearanceSettings() {
  const { appearance: storedAppearance, changeAppearance } =
    useContext(AuthContext);

  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const [appearance, setAppearance] = useState(storedAppearance);

  /*
    EFFECTS
  */

  useEffect(() => {
    const storeApperance = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, appearance);
      } catch (e) {
        console.log(e);
      }
    };

    if (appearance) {
      storeApperance();
    }
  }, [appearance]);

  /*
    HANDLERS
  */

  const handleChange = (newAppearance: string) => {
    changeAppearance(newAppearance);
    setAppearance(newAppearance);
  };

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>{CONSTS.TITLE}</StyledText>
      <View style={styles.inputContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => handleChange("DEVICE")}
            style={
              appearance === "DEVICE"
                ? { ...styles.button, ...styles.active }
                : { ...styles.button, ...styles.inactive }
            }
          >
            <StyledText style={styles.labelText}>Device</StyledText>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => handleChange("LIGHT")}
            style={
              appearance === "LIGHT"
                ? { ...styles.button, ...styles.active }
                : { ...styles.button, ...styles.inactive }
            }
          >
            <StyledText style={styles.labelText}>Light</StyledText>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => handleChange("DARK")}
            style={
              appearance === "DARK"
                ? { ...styles.button, ...styles.active }
                : { ...styles.button, ...styles.inactive }
            }
          >
            <StyledText style={styles.labelText}>Dark</StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    active: {
      backgroundColor: colors.primary,
    },
    button: {
      alignItems: "center",
      borderRadius: 5,
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      width: "100%",
    },
    buttonContainer: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      marginHorizontal: 3,
      height: 45,
    },
    container: {
      alignItems: "center",
      flex: 1,
      marginTop: 50,
      width: "100%",
    },
    inactive: {},
    inputContainer: {
      backgroundColor: colors.container,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10,
      width: "100%",
    },
    labelText: {
      width: "100%",
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },
  });
};

const CONSTS = {
  ALERT_BTN: "ok",
  ALERT_MESSAGE: "An error has occured: ",
  ALERT_TITLE: "Something went wrong",
  TITLE: "Appearance",
};
