import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import LottieView from "lottie-react-native";

import { AuthContext } from "../components/AuthComposition";
import { NetworkContext } from "../components/NetworkComposition";
import { StyledText } from "../components/StyledText";
import {
  CustomTheme,
  HTTPAction,
  RequestState,
  Route,
  SuperContestThemeColors,
} from "../types/types";
import { SuccessButton } from "../components/SuccessButton";

enum PageState {
  IDLE,
  DIRTY,
  LOADING,
  SUCCESS,
}

export default function JoinLeague() {
  const { addLeague, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pageState, setPageState] = useState(PageState.IDLE);

  /*
    EFFECTS
  */

  useEffect(() => {
    if (code.length) {
      setPageState(PageState.DIRTY);
    }
  }, [code]);

  /*
    NETWORK
  */

  const joinRequest = async () => {
    const response = await sendNetworkRequest!(
      HTTPAction.POST,
      {
        code,
      },
      null,
      Route.JOIN_LEAGUE,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ERROR_MESSAGE}${response.message}`;
      setErrorMessage(message);
      setPageState(PageState.DIRTY);
      return;
    }

    setPageState(PageState.SUCCESS);
    setErrorMessage("");
    setCode("");
    addLeague(response.league);
  };

  /*
    HANDLERS
  */

  const handleJoin = () => {
    setPageState(PageState.LOADING);
    joinRequest();
  };

  return (
    <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <StyledText style={styles.label}>{CONSTS.LABEL}</StyledText>
          <TextInput onChangeText={setCode} style={styles.input} value={code} />
        </View>

        <View style={styles.btnContainer}>
          <SuccessButton
            animationFinish={() => setPageState(PageState.IDLE)}
            disabled={pageState !== PageState.DIRTY}
            handlePress={handleJoin}
            loading={pageState === PageState.LOADING}
            success={pageState === PageState.SUCCESS}
          >
            {CONSTS.BTN_TEXT}
          </SuccessButton>
        </View>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <StyledText style={styles.errorText}>{errorMessage}</StyledText>
          </View>
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    btn: {
      alignItems: "center",
      backgroundColor: colors.activeGreen,
      borderRadius: 5,
      height: 45,
      justifyContent: "center",
      padding: 5,
      width: "100%",
    },
    btnContainer: {
      marginTop: 10,
      width: "90%",
    },
    btnText: { color: "#000" },
    container: {
      alignItems: "center",
      flex: 1,
      paddingVertical: 20,
    },
    errorContainer: {
      backgroundColor: colors.negative,
      borderRadius: 5,
      marginTop: 20,
      padding: 10,
    },
    errorText: {
      color: "#000",
      textAlign: "center",
    },
    input: {
      color: colors.textColor,
      fontSize: 18,
      padding: 10,
    },
    inputContainer: {
      backgroundColor: colors.container,

      width: "100%",
    },
    label: {
      fontSize: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
  });
};

const CONSTS = {
  BTN_TEXT: "Join",
  ERROR_MESSAGE: "Something went wrong: ",
  LABEL: "Enter Code",
};
