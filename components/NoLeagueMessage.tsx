import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { AuthContext } from "./AuthComposition";
import { NetworkContext } from "./NetworkComposition";
import { StyledButton } from "./StyledButton";
import { StyledText } from "./StyledText";
import { CustomTheme, SuperContestThemeColors } from "../types/types";

export default function NoLeagueMessage() {
  const { user, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const navigation = useNavigation();
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>{CONSTS.TITLE}</StyledText>
      <View style={styles.instructions}>
        <StyledText>1. Pick a contest</StyledText>
        <StyledText>2. Name league</StyledText>
        <StyledText>3. Invite friends</StyledText>
        <StyledText>4. Make picks!</StyledText>
        <StyledButton
          handlePress={() => navigation.navigate("CreateLeague")}
          style={styles.button}
        >
          {CONSTS.CREATE_BTN}
        </StyledButton>
      </View>
      <View style={styles.separator} />
      <View style={styles.instructions}>
        <StyledText>1. Get invite code from friend</StyledText>
        <StyledText>2. Join league</StyledText>
        <StyledText>3. Make picks!</StyledText>
        <StyledButton
          handlePress={() => navigation.navigate("CreateLeague")}
          style={styles.button}
        >
          {CONSTS.JOIN_BTN}
        </StyledButton>
      </View>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    button: {
      marginTop: 25,
      width: 200,
    },
    container: {
      alignItems: "center",
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 20,
    },
    instructions: {},
    separator: {
      alignSelf: "center",
      backgroundColor: colors.textColor,
      height: 1,
      marginVertical: 30,
      width: "80%",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 30,
    },
  });
};

const CONSTS = {
  CREATE_BTN: "Create new league",
  JOIN_BTN: "Join new league",
  TITLE: "Join a league first!",
};
