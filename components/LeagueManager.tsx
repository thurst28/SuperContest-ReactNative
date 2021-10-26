import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useContext } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AuthContext } from "./AuthComposition";
import { NetworkContext } from "./NetworkComposition";
import { StyledText } from "./StyledText";
import {
  CustomTheme,
  HTTPAction,
  RequestState,
  Route,
  SuperContestThemeColors,
} from "../types/types";
import { TouchableOpacity } from "react-native-gesture-handler";
import { StyledButton } from "./StyledButton";

export default function LeagueManager() {
  const { removeLeague, user, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const navigation = useNavigation();

  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  /*
    NETWORK
  */

  const deleteLeague = async (leagueId: string) => {
    const response = await sendNetworkRequest!(
      HTTPAction.PUT,
      {
        leagueId,
      },
      null,
      Route.DELETE_LEAGUE,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ALERT_MESSAGE}${response.message}`;
      Alert.alert(CONSTS.ALERT_TITLE, message, [{ text: CONSTS.ALERT_BTN }]);
      return;
    }

    // SUCCESS
    Alert.alert(CONSTS.DELETE_SUCCESS, "", [{ text: CONSTS.ALERT_BTN }]);
    removeLeague(leagueId);
  };

  const leaveLeague = async (leagueId: string) => {
    const response = await sendNetworkRequest!(
      HTTPAction.DELETE,
      {
        leagueId,
      },
      null,
      Route.LEAVE_LEAGUE,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ALERT_MESSAGE}${response.message}`;
      Alert.alert(CONSTS.ALERT_TITLE, message, [{ text: CONSTS.ALERT_BTN }]);
      return;
    }

    // SUCCESS
    Alert.alert(CONSTS.LEAVE_SUCCESS, "", [{ text: CONSTS.ALERT_BTN }]);
    removeLeague(leagueId);
  };

  /*
    HANDLERS
  */

  const confirmAlert = (isAdmin: boolean, leagueId: string) => {
    const message = isAdmin
      ? CONSTS.CONFIRM_ALERT_DELETE_MESSAGE
      : CONSTS.CONFIRM_ALERT_LEAVE_MESSAGE;
    Alert.alert(CONSTS.CONFIRM_ALERT_TITLE, message, [
      { text: CONSTS.CONFIRM_ALERT_CANCEL_BTN, style: "cancel" },
      {
        text: CONSTS.CONFIRM_ALERT_CONFIRM_BTN,
        onPress: () =>
          isAdmin ? deleteLeague(leagueId) : leaveLeague(leagueId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>{CONSTS.TITLE}</StyledText>
      <View style={styles.leagueContainer}>
        {user?.leagues.map((league) => {
          const userIsAdmin = league.admin === user.id;
          return (
            <View key={league.id} style={styles.leagueCard}>
              <StyledText style={styles.leagueTitle}>{league.name}</StyledText>
              <StyledText style={styles.leagueText}>
                {league.contest}
              </StyledText>
              {userIsAdmin && (
                <StyledText style={{ ...styles.leagueText, fontSize: 14 }}>
                  {CONSTS.ADMIN}
                </StyledText>
              )}
              <TouchableOpacity
                onPress={() => confirmAlert(userIsAdmin, league.id)}
                style={styles.deleteBtn}
              >
                <StyledText style={styles.deleteBtnText}>
                  {userIsAdmin ? CONSTS.DELETE_BTN : CONSTS.LEAVE_BTN}
                </StyledText>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <View style={styles.btnContainer}>
        <StyledButton handlePress={() => navigation.navigate("JoinLeague")}>
          {CONSTS.JOIN_BTN}
        </StyledButton>
        <StyledButton
          handlePress={() => navigation.navigate("CreateLeague")}
          style={{ marginTop: 5 }}
        >
          {CONSTS.CREATE_BTN}
        </StyledButton>
      </View>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    btnContainer: {
      marginTop: 10,
      width: "90%",
    },
    container: {
      alignItems: "center",
      flex: 1,
      marginTop: 50,
    },
    deleteBtn: {
      marginTop: 15,
    },
    deleteBtnText: {
      color: colors.textColor,
      fontSize: 12,
    },
    leagueCard: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 5,
      marginVertical: 5,
      minHeight: 45,
      padding: 10,
      width: "80%",
    },
    leagueContainer: {
      alignItems: "center",
      width: "100%",
    },
    leagueText: {
      fontSize: 16,
    },
    leagueTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    newBtn: {
      alignItems: "center",
      backgroundColor: colors.activeGreen,
      borderRadius: 5,
      height: 45,
      justifyContent: "center",
      marginVertical: 2,
      padding: 5,
    },
    newBtnText: {
      color: "#000",
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },
  });
};

const CONSTS = {
  ADMIN: "Admin",
  ALERT_BTN: "ok",
  ALERT_MESSAGE: "An error has occured: ",
  ALERT_TITLE: "Something went wrong",
  CONFIRM_ALERT_CANCEL_BTN: "Cancel",
  CONFIRM_ALERT_CONFIRM_BTN: "Yes",
  CONFIRM_ALERT_TITLE: "Are You Sure ?",
  CONFIRM_ALERT_LEAVE_MESSAGE: "Confirm you want to leave this league",
  CONFIRM_ALERT_DELETE_MESSAGE: "Confirm you want to delete this league",
  CREATE_BTN: "Create League",
  DELETE_BTN: "Delete",
  DELETE_SUCCESS: "Deleted League",
  LEAVE_BTN: "Leave",
  LEAVE_SUCCESS: "Left League",
  JOIN_BTN: "Join League",
  TITLE: "Leagues",
};
