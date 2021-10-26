import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import LottieView from "lottie-react-native";

import { AuthContext } from "../components/AuthComposition";
import { NetworkContext } from "../components/NetworkComposition";
import { StyledText } from "../components/StyledText";
import {
  Contest,
  CustomTheme,
  HTTPAction,
  RequestState,
  Route,
  SuperContestThemeColors,
} from "../types/types";
import { SuccessButton } from "../components/SuccessButton";

enum PageState {
  CREATING_LEAGUE,
  DIRTY,
  IDLE,
  LOADING,
  SUCCESS,
}

export default function CreateLeague() {
  const { addLeague, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const [activeContest, setActiveContest] = useState("");
  const [contestList, setContestList] = useState<Contest[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [pageState, setPageState] = useState(PageState.LOADING);

  /*
    EFFECTS
  */

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (leagueName.length) {
      setPageState(PageState.DIRTY);
    }
  }, [leagueName]);

  /*
    NETWORK
  */

  const fetchContests = async () => {
    const response = await sendNetworkRequest!(
      HTTPAction.GET,
      null,
      null,
      Route.ALL_CONTESTS,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ERROR_MESSAGE}${response.message}`;
      setErrorMessage(message);
      setPageState(PageState.IDLE);
      return;
    }

    // SUCCESS

    const { all } = response;
    setContestList(all);
    setActiveContest(all[0].name);
    setPageState(PageState.IDLE);
  };

  const createLeague = async () => {
    const response = await sendNetworkRequest!(
      HTTPAction.POST,
      { contest: activeContest, name: leagueName },
      null,
      Route.CREATE_LEAGUE,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      const message = `${CONSTS.ERROR_MESSAGE}${response.message}`;
      setErrorMessage(message);
      setPageState(PageState.DIRTY);
      return;
    }

    // SUCCESS
    const { league } = response;
    setPageState(PageState.SUCCESS);
    setErrorMessage("");
    setLeagueName("");
    addLeague(league);
  };

  /*
    HANDLERS
  */

  const handleCreate = () => {
    setPageState(PageState.CREATING_LEAGUE);
    createLeague();
  };

  /*
    UI
  */

  if (pageState === PageState.LOADING) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={custom.colors.activeGreen} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.pickerContainer}>
              <StyledText style={styles.label}>
                {CONSTS.LEAGUE_LABEL}
              </StyledText>
              <Picker
                itemStyle={styles.pickerItem}
                onValueChange={setActiveContest}
                selectedValue={activeContest}
                style={styles.picker}
              >
                {contestList.map((contest) => {
                  return (
                    <Picker.Item
                      key={contest.id}
                      label={contest.name}
                      value={contest.name}
                    />
                  );
                })}
              </Picker>
            </View>
            <View style={styles.inputContainer}>
              <StyledText style={styles.label}>{CONSTS.NAME_LABEL}</StyledText>
              <TextInput
                onChangeText={setLeagueName}
                style={styles.input}
                value={leagueName}
              />
            </View>

            <View style={styles.btnContainer}>
              <SuccessButton
                animationFinish={() => setPageState(PageState.IDLE)}
                disabled={pageState !== PageState.DIRTY}
                handlePress={handleCreate}
                loading={pageState === PageState.CREATING_LEAGUE}
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    loader: {
      backgroundColor: "transparent",
      flex: 1,
      justifyContent: "center",
    },
    picker: {
      alignItems: "center",
      height: 100,
      margin: 0,
      width: 200,
    },
    pickerContainer: {
      alignItems: "center",
      height: 115,
      marginBottom: 25,
      padding: 0,
      width: "100%",
    },
    pickerItem: {
      color: colors.textColor,
      height: 100,
      width: 100,
    },
  });
};

const CONSTS = {
  BTN_TEXT: "Create",
  ERROR_MESSAGE: "Something went wrong: ",
  NAME_LABEL: "League Name",
  LEAGUE_LABEL: "Sport",
};
