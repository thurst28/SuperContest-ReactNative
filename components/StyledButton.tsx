import React, { ReactNode } from "react";
import { useTheme } from "@react-navigation/native";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { StyledText } from "./StyledText";
import { CustomTheme, SuperContestThemeColors } from "../types/types";
import { TouchableOpacity } from "react-native-gesture-handler";

type StyledButtonProps = {
  children: ReactNode;
  handlePress: () => void;
  disabled?: boolean;

  loading?: boolean;
  style?: { [key: string]: string | number };
};

export function StyledButton({
  children,
  handlePress,
  disabled,
  loading,
  style,
}: StyledButtonProps) {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const disabledState = disabled || loading;

  return (
    <View style={{ ...styles.container, ...style }}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabledState}
        onPress={handlePress}
        style={{
          ...styles.button,
          backgroundColor: disabledState
            ? custom.colors.disabledColor
            : custom.colors.activeGreen,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={custom.colors.activeGreen} />
        ) : (
          <StyledText
            style={{
              ...styles.buttonText,
              color: disabled ? custom.colors.disabledText : "#000",
            }}
          >
            {children}
          </StyledText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    button: {
      alignItems: "center",
      borderRadius: 5,
      elevation: 8,
      height: "100%",
      justifyContent: "center",
      padding: 10,
    },
    buttonText: {
      fontWeight: "bold",
    },
    container: {
      height: 45,
      width: "100%",
    },
  });
};
