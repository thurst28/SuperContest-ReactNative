import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Switch } from "react-native-gesture-handler";

import {
  CustomTheme,
  HTTPAction,
  RequestState,
  Route,
  SuperContestThemeColors,
} from "../types/types";
import { AuthContext } from "./AuthComposition";
import { NetworkContext } from "./NetworkComposition";
import { StyledText } from "./StyledText";

export default function NotificationSettings() {
  const { devicePushToken, user, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const [email, setEmail] = useState(false);
  const [push, setPush] = useState(false);

  /*
    EFFECTS
  */

  useEffect(() => {
    setEmail(user?.notifications ?? false);
  }, []);

  useEffect(() => {
    if (devicePushToken) {
      const pushDisabled =
        user?.disabledPushTokens.includes(devicePushToken) ?? true;
      setPush(!pushDisabled);
    }
  }, [devicePushToken]);

  /*
    NETWORK
  */

  const sendEmailNetworkRequest = async (newEmailValue: boolean) => {
    const response = await sendNetworkRequest!(
      HTTPAction.PATCH,
      {
        notifications: newEmailValue,
      },
      null,
      `${Route.USER}/${user?.id}`,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ALERT_MESSAGE}${response.message}`;
      Alert.alert(CONSTS.ALERT_TITLE, message, [{ text: CONSTS.ALERT_BTN }]);
      return;
    }
  };

  const sendPushNetworkRequest = async (newDisabledTokenArray: string[]) => {
    const response = await sendNetworkRequest!(
      HTTPAction.PATCH,
      {
        disabledPushTokens: newDisabledTokenArray,
      },
      null,
      `${Route.USER}/${user?.id}`,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ALERT_MESSAGE}${response.message}`;
      Alert.alert(CONSTS.ALERT_TITLE, message, [{ text: CONSTS.ALERT_BTN }]);
      return;
    }
  };

  /*
    HANDLERS
  */

  const onEmailChange = () => {
    const newValue = !email;
    setEmail(newValue);
    sendEmailNetworkRequest(newValue);
  };

  const onPushChange = () => {
    const newValue = !push;
    setPush(newValue);

    if (!devicePushToken) {
      return;
    }

    let disabledTokens = user?.disabledPushTokens ?? [];
    if (newValue === false) {
      disabledTokens.push(devicePushToken!);
    } else {
      const index = disabledTokens.indexOf(devicePushToken!);
      disabledTokens.splice(index, 1);
    }

    sendPushNetworkRequest(disabledTokens);
  };

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>{CONSTS.TITLE}</StyledText>
      <View style={styles.inputContainer}>
        <StyledText style={styles.labelText}>{CONSTS.EMAIL_LABEL}</StyledText>
        <Switch
          ios_backgroundColor={custom.colors.disabledColor}
          trackColor={{
            false: custom.colors.disabledColor,
            true: custom.colors.activeGreen,
          }}
          onValueChange={onEmailChange}
          value={email}
        />
      </View>
      <View style={{ ...styles.inputContainer, borderBottomWidth: 0 }}>
        <StyledText style={styles.labelText}>{CONSTS.PUSH_LABEL}</StyledText>
        <Switch
          ios_backgroundColor={custom.colors.disabledColor}
          trackColor={{
            false: custom.colors.disabledColor,
            true: custom.colors.activeGreen,
          }}
          onValueChange={onPushChange}
          value={push}
        />
      </View>
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
    inputContainer: {
      alignItems: "center",
      backgroundColor: colors.container,
      borderBottomWidth: 0.5,
      borderColor: colors.disabledText,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10,
      width: "100%",
    },
    labelText: {},
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
  EMAIL_LABEL: "Email",
  PUSH_LABEL: "Push",
  TITLE: "Notifications",
};
