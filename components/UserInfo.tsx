import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { AuthContext } from "../components/AuthComposition";
import { NetworkContext } from "../components/NetworkComposition";
import LottieView from "lottie-react-native";

import { StyledText } from "../components/StyledText";
import {
  CustomTheme,
  HTTPAction,
  RequestState,
  Route,
  SuperContestThemeColors,
} from "../types/types";
import { SuccessButton } from "./SuccessButton";

type LocalState = {
  email: Input;
  pageState: PageState;
  username: Input;
  venmo: Input;
};

type Input = {
  status: InputStatus;
  value: string;
};

enum InputStatus {
  "INVALID",
  "VALID",
}

enum PageState {
  "LOADING",
  "IDLE",
  "DIRTY",
  "SUCCESS",
}

export enum UserReducerAction {
  INIT_INPUT,
  SET_LOADING,
  SET_IDLE,
  SET_SUCCESS,
  SET_EMAIL,
  SET_USERNAME,
  SET_VENMO,
}

export type UserReducerDispatcher =
  | {
      type: UserReducerAction.INIT_INPUT;
      payload: { email: string; username: string; venmo: string };
    }
  | { type: UserReducerAction.SET_EMAIL; payload: { email: string } }
  | { type: UserReducerAction.SET_LOADING }
  | { type: UserReducerAction.SET_IDLE }
  | { type: UserReducerAction.SET_SUCCESS }
  | { type: UserReducerAction.SET_USERNAME; payload: { username: string } }
  | { type: UserReducerAction.SET_VENMO; payload: { venmo: string } };

const initialState: LocalState = {
  email: {
    status: InputStatus.VALID,
    value: "",
  },
  pageState: PageState.IDLE,
  username: {
    status: InputStatus.VALID,
    value: "",
  },
  venmo: {
    status: InputStatus.VALID,
    value: "",
  },
};

const reducer = (
  state: LocalState,
  action: UserReducerDispatcher
): LocalState => {
  switch (action.type) {
    case UserReducerAction.INIT_INPUT: {
      const { email, username, venmo } = action.payload;
      return {
        ...state,
        email: { ...state.email, value: email },
        username: { ...state.username, value: username },
        venmo: { ...state.venmo, value: venmo },
      };
    }
    case UserReducerAction.SET_EMAIL: {
      const { email } = action.payload;

      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const validEmail = re.test(String(email).toLowerCase());

      const status = validEmail ? InputStatus.VALID : InputStatus.INVALID;
      return {
        ...state,
        email: { status, value: email },
        pageState: PageState.DIRTY,
      };
    }
    case UserReducerAction.SET_LOADING: {
      return {
        ...state,
        pageState: PageState.LOADING,
      };
    }
    case UserReducerAction.SET_IDLE: {
      return {
        ...state,
        pageState: PageState.IDLE,
      };
    }
    case UserReducerAction.SET_SUCCESS: {
      return {
        ...state,
        pageState: PageState.SUCCESS,
      };
    }
    case UserReducerAction.SET_USERNAME: {
      const { username } = action.payload;
      const status = InputStatus.VALID;
      return {
        ...state,
        pageState: PageState.DIRTY,
        username: { status, value: username },
      };
    }
    case UserReducerAction.SET_VENMO: {
      const { venmo } = action.payload;
      const status = InputStatus.VALID;
      return {
        ...state,
        pageState: PageState.DIRTY,
        venmo: { status, value: venmo },
      };
    }
  }
};

export default function UserInfo() {
  const { user, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({
      type: UserReducerAction.INIT_INPUT,
      payload: {
        email: user?.email ?? "",
        username: user?.name ?? "",
        venmo: user?.venmo ?? "",
      },
    });
  }, []);

  /*
    NETWORK
  */

  const handleSave = async () => {
    dispatch({ type: UserReducerAction.SET_LOADING });

    const response = await sendNetworkRequest!(
      HTTPAction.PATCH,
      {
        name: state?.username.value,
        email: state?.email.value,
        venmo: state?.venmo.value,
      },
      null,
      `${Route.USER}/${user?.id}`,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ALERT_MESSAGE}${response.message}`;
      Alert.alert(CONSTS.ALERT_TITLE, message, [{ text: CONSTS.ALERT_BTN }]);
      dispatch({ type: UserReducerAction.SET_IDLE });
      return;
    }

    // SUCCESS

    dispatch({ type: UserReducerAction.SET_SUCCESS });
  };

  return (
    <View style={styles.userInfoContainer}>
      <StyledText style={styles.title}>{CONSTS.TITLE}</StyledText>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={CONSTS.USERNAME_PLACEHOLDER}
          onChangeText={(text) =>
            dispatch({
              type: UserReducerAction.SET_USERNAME,
              payload: { username: text },
            })
          }
          style={styles.input}
          value={state.username.value}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          autoCompleteType="email"
          autoCapitalize="none"
          onChangeText={(text) => {
            return dispatch({
              type: UserReducerAction.SET_EMAIL,
              payload: { email: text },
            });
          }}
          keyboardType="email-address"
          placeholder={CONSTS.EMAIL_PLACEHOLDER}
          style={styles.input}
          value={state.email.value}
        />
        {state.email.status === InputStatus.INVALID ? (
          <StyledText style={styles.invalidText}>
            {CONSTS.INVALID_EMAIL}
          </StyledText>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder={CONSTS.VENMO_PLACEHOLDER}
          onChangeText={(text) =>
            dispatch({
              type: UserReducerAction.SET_VENMO,
              payload: { venmo: text.replace("@", "") },
            })
          }
          style={{ ...styles.input, borderBottomWidth: 0 }}
          value={`@${state.venmo.value.replace("@", "")}`}
        />
      </View>
      <View style={styles.saveBtnContainer}>
        <SuccessButton
          animationFinish={() => dispatch({ type: UserReducerAction.SET_IDLE })}
          disabled={state.pageState !== PageState.DIRTY}
          handlePress={handleSave}
          loading={state.pageState === PageState.LOADING}
          success={state.pageState === PageState.SUCCESS}
        >
          {CONSTS.SAVE_BTN_TEXT}
        </SuccessButton>
      </View>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    input: {
      borderBottomWidth: 0.75,
      borderColor: colors.disabledText,
      color: colors.textColor,
      padding: 12,
      width: "100%",
    },
    inputContainer: {
      backgroundColor: colors.container,
      paddingVertical: 2,
      width: "100%",
    },
    invalidText: {
      color: colors.negative,
      fontSize: 12,
      padding: 3,
    },
    saveBtn: {
      alignItems: "center",
      backgroundColor: colors.activeGreen,
      borderRadius: 5,
      height: 45,
      justifyContent: "center",
      padding: 5,
      width: "100%",
    },
    saveBtnContainer: {
      marginTop: 10,
      width: "90%",
    },
    saveBtnText: {
      color: "#000",
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },
    userInfoContainer: {
      alignItems: "center",
    },
  });
};

const CONSTS = {
  ALERT_BTN: "ok",
  ALERT_MESSAGE: "An error has occured: ",
  ALERT_TITLE: "Something went wrong",
  EMAIL_PLACEHOLDER: "Email",
  INVALID_EMAIL: "Invalid Email",
  SAVE_BTN_TEXT: "Save",
  TITLE: "Edit Profile",
  USERNAME_PLACEHOLDER: "Username",
  VENMO_PLACEHOLDER: "@Venmo",
};
