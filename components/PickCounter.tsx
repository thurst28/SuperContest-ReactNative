import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import { CustomTheme, SuperContestThemeColors } from "../types/types";

export default function PickCounter({
  pickCount,
  max,
  startShake,
}: {
  pickCount: number;
  max: number;
  startShake: boolean;
}) {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const pickerRef = useRef(null);

  const shake = () => {
    if (pickerRef) {
      pickerRef.current.shake(800).then(() => {});
    }
  };

  useEffect(() => {
    if (pickerRef.current && startShake) {
      shake();
    }
  }, [pickerRef, startShake]);

  return (
    <Animatable.View ref={pickerRef} style={styles.container}>
      {[...Array(max)].map((_, i) => {
        return (
          <View
            key={i}
            style={{
              ...styles.circle,
              backgroundColor:
                i + 1 > pickCount
                  ? custom.colors.disabledText
                  : custom.colors.textColor,
            }}
          ></View>
        );
      })}
    </Animatable.View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  const circleSize = 8;
  return StyleSheet.create({
    circle: {
      borderRadius: circleSize / 2,
      backgroundColor: colors.disabledText,
      height: circleSize,
      margin: 2,
      width: circleSize,
    },
    container: {
      flexDirection: "row",
      justifyContent: "center",
      padding: 10,
    },
    pickCounter: {
      color: colors.textColor,
    },
  });
};
