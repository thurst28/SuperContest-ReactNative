import LottieView from "lottie-react-native";
import React, { ReactNode } from "react";
import { useTheme } from "@react-navigation/native";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { StyledText } from "./StyledText";
import { CustomTheme, SuperContestThemeColors } from "../types/types";
import { TouchableOpacity } from "react-native-gesture-handler";

type SuccessButtonProps = {
  animationFinish: () => void;
  children: ReactNode;
  handlePress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: { [key: string]: string | number };
  success: boolean;
};

export function SuccessButton({
  animationFinish,
  children,
  handlePress,
  disabled,
  loading,
  style,
  success,
}: SuccessButtonProps) {
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
          <ActivityIndicator color={custom.colors.activeGreen} />
        ) : !success ? (
          <StyledText
            style={{
              ...styles.buttonText,
              color: disabled ? custom.colors.disabledText : "#000",
            }}
          >
            {children}
          </StyledText>
        ) : (
          <LottieView
            source={require("../assets/lottie/success.json")}
            autoPlay
            loop={false}
            onAnimationFinish={animationFinish}
          />
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
