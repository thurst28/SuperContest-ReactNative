import { useTheme } from "@react-navigation/native";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { AuthContext } from "./AuthComposition";
import { StyledText } from "./StyledText";
import { CustomTheme, SuperContestThemeColors } from "../types/types";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Logout() {
  const { logout } = useContext(AuthContext);

  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={logout}>
        <StyledText style={styles.btnText}>{CONSTS.LABEL}</StyledText>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      flex: 1,
      marginTop: 50,
    },
    btnText: {
      color: colors.negative,
      fontSize: 18,
      fontWeight: "bold",
    },
  });
};

const CONSTS = {
  LABEL: "Log out",
};
