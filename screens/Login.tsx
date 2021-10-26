import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";

import { AuthContext } from "../components/AuthComposition";
import { NetworkContext } from "../components/NetworkComposition";
import {
  CustomTheme,
  RequestState,
  HTTPAction,
  Route,
  SuperContestThemeColors,
} from "../types/types";
import { StyledText } from "../components/StyledText";
import { StyledButton } from "../components/StyledButton";

enum FormState {
  INVALID,
  VALID,
}

export default function Login() {
  const { setUser, setUserToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formState, setFormState] = useState<FormState>(FormState.INVALID);
  const [password, setPassword] = useState("");
  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.IDLE
  );

  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  useEffect(() => {
    let newFormState = FormState.VALID;
    if (!email || !password || password.length < 8) {
      newFormState = FormState.INVALID;
    }
    setFormState(newFormState);
  }, [email, password]);

  useEffect(() => {
    if (requestState === RequestState.LOADING) {
      sendLoginRequest();
    }
  }, [requestState]);

  const sendLoginRequest = async () => {
    const response = await sendNetworkRequest!(
      HTTPAction.POST,
      { email, password },
      null,
      Route.LOGIN,
      ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      setRequestState(RequestState.ERROR);
      setErrorMessage(response.message);
      return;
    }

    const { user, tokens } = response;

    setUser(user);
    setUserToken({ token: tokens.access.token, id: user.id });
  };

  /*
    UI
  */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.inner}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          {requestState === RequestState.ERROR && (
            <View style={styles.errorMessage}>
              <StyledText style={styles.errorMessageText}>
                {errorMessage}
              </StyledText>
            </View>
          )}
          <LinearGradient
            colors={[
              "rgba(69, 55, 252, 1)",
              "rgba(109, 21, 191, 1)",
              "rgba(118, 13, 177, 1)",
            ]}
            end={{ x: 0.2, y: 1.32 }}
            locations={[0, 0.82, 1]}
            style={styles.linearGradient}
          >
            <StyledText style={styles.title}>{LoginConstants.TITLE}</StyledText>
            <TextInput
              autoCompleteType="email"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="email"
              placeholderTextColor={custom.colors.disabledText}
              style={styles.input}
              value={email}
            />
            <TextInput
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor={custom.colors.disabledText}
              secureTextEntry={true}
              style={styles.input}
              value={password}
            />
            <StyledButton
              disabled={formState === FormState.INVALID}
              handlePress={() => setRequestState(RequestState.LOADING)}
              loading={requestState === RequestState.LOADING}
              style={{ marginLeft: 10, marginTop: 10, width: 85 }}
            >
              {LoginConstants.BTN_TEXT}
            </StyledButton>
          </LinearGradient>
          <View style={styles.logo}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
            />
            <StyledText style={styles.logoText}>
              {LoginConstants.LOGO_TEXT}
            </StyledText>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    inner: {
      backgroundColor: "#010038",
      padding: 10,
      paddingBottom: 50,
      flex: 1,
    },
    errorMessage: {
      backgroundColor: colors.negative,
      borderRadius: 5,
      fontWeight: "bold",
      padding: 15,
      marginVertical: 10,
    },
    errorMessageText: {
      color: "#000",
    },
    input: {
      borderBottomWidth: 1,
      borderColor: colors.lightBlue,
      borderWidth: 0,
      color: "#fff",
      height: 45,
      margin: 12,
    },
    linearGradient: {
      borderRadius: 5,
      flex: 1,
      maxHeight: 300,
      padding: 10,
    },
    logo: {
      alignItems: "center",
      marginTop: 20,
      padding: 10,
    },
    logoImage: {
      width: 50,
      height: 50,
    },
    logoText: {
      color: colors.activeGreen,
    },
    disabledSubmitBtn: {
      backgroundColor: colors.disabledColor,
    },
    enabledSubmitBtn: {},
    submitBtn: {
      alignItems: "center",
      borderRadius: 5,
      backgroundColor: colors.activeGreen,
      height: 45,
      justifyContent: "center",
      margin: 10,
      padding: 10,
      width: 85,
    },
    submitBtnText: {
      color: "#000",
      fontWeight: "bold",
    },
    title: {
      color: "#fff",
      fontWeight: "bold",
      paddingHorizontal: 10,
      paddingVertical: 20,
    },
  });
};

const LoginConstants = {
  BTN_TEXT: "Log in",
  LOGO_TEXT: "YamYum SuperContest",
  TITLE: "Login",
};
