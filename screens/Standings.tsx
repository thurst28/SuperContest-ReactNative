import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { AuthContext } from "../components/AuthComposition";
import { NetworkContext } from "../components/NetworkComposition";
import NoLeagueMessage from "../components/NoLeagueMessage";
import Picker from "../components/Picker";
import Podium from "../components/Podium";
import StandingsRow from "../components/StandingsRow";
import { StyledText } from "../components/StyledText";
import { View } from "../components/Themed";
import {
  User,
  Game,
  RequestState,
  HTTPAction,
  Route,
  League,
  CustomTheme,
  SuperContestThemeColors,
} from "../types/types";

type LocalState = {
  activeLeague: League | null;
  errorMessage: string;
  ohfers: Ohfer[];
  pageState: PageState;
  standings: User[];
};

type Ohfer = {
  id: number;
  cold: boolean;
  games: Game[];
  gold: boolean;
  round: number;
  userName: string;
};

enum PageState {
  "LOADING",
  "LOADING_STANDINGS",
  "IDLE",
  "ERROR",
}

export enum StandingsReducerAction {
  SET_ACTIVE_LEAGUE,
  SET_ERROR,
  SET_LEAGUE_DATA,
}

export type StandingsReducerDispatcher =
  | { type: StandingsReducerAction.SET_ERROR; payload: { message: string } }
  | {
      type: StandingsReducerAction.SET_ACTIVE_LEAGUE;
      payload: { activeLeague: League };
    }
  | {
      type: StandingsReducerAction.SET_LEAGUE_DATA;
      payload: { ohfers: Ohfer[]; standings: User[] };
    };

const initialState: LocalState = {
  activeLeague: null,
  errorMessage: "",
  ohfers: [],
  pageState: PageState.LOADING,
  standings: [],
};

function reducer(
  state: LocalState,
  action: StandingsReducerDispatcher
): LocalState {
  switch (action.type) {
    case StandingsReducerAction.SET_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        pageState: PageState.ERROR,
      };
    case StandingsReducerAction.SET_ACTIVE_LEAGUE:
      return {
        ...state,
        activeLeague: action.payload.activeLeague,
        pageState: PageState.LOADING_STANDINGS,
      };
    case StandingsReducerAction.SET_LEAGUE_DATA:
      return {
        ...state,
        ohfers: action.payload.ohfers,
        standings: action.payload.standings,
        pageState: PageState.IDLE,
      };
  }
}

export default function Standings() {
  const { user, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const navigation = useNavigation();

  const [state, dispatch] = useReducer(reducer, initialState);

  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  /*
    EFFECTS
  */

  useEffect(() => {
    if (!userToken || !user) {
      return;
    }

    const activeLeague = user?.leagues?.[0] ?? null;

    dispatch({
      type: StandingsReducerAction.SET_ACTIVE_LEAGUE,
      payload: { activeLeague: activeLeague },
    });
  }, [userToken, user]);

  useEffect(() => {
    if (!state.activeLeague) {
      return;
    }

    setupScreen();
  }, [state.activeLeague]);

  /*
    NETWORK
  */

  const setupScreen = async () => {
    const standingsRequest = fetchStandings();
    const ohferRequest = fetchOhferWeeks();

    const [standingsResponse, ohferResponse] = await Promise.all([
      standingsRequest,
      ohferRequest,
    ]);

    if (state.pageState === PageState.ERROR) {
      console.log("ERROR", state.errorMessage);
      return;
    }

    // ERROR

    if (standingsResponse.status === RequestState.ERROR) {
      dispatch({
        type: StandingsReducerAction.SET_ERROR,
        payload: { message: standingsResponse.message },
      });

      return;
    }

    if (ohferResponse.status === RequestState.ERROR) {
      dispatch({
        type: StandingsReducerAction.SET_ERROR,
        payload: { message: ohferResponse.message },
      });

      return;
    }

    // SUCCESS

    const { standings } = standingsResponse;
    const { ohfers } = ohferResponse;

    dispatch({
      type: StandingsReducerAction.SET_LEAGUE_DATA,
      payload: { ohfers, standings },
    });
  };

  const fetchStandings = () => {
    return sendNetworkRequest!(
      HTTPAction.GET,
      null,
      {
        count: "100",
        leagueId: state.activeLeague?.id ?? "",
        page: "0",
      },
      Route.STANDINGS,
      userToken?.token ?? ""
    );
  };

  const fetchOhferWeeks = () => {
    return sendNetworkRequest!(
      HTTPAction.GET,
      null,
      {
        leagueId: state.activeLeague?.id ?? "",
      },
      Route.OHFER_WEEKS,
      userToken?.token ?? ""
    );
  };

  /*
    COMPONENTS
  */

  const Header = () => {
    return (
      <View style={styles.header}>
        <Picker
          activeId={state.activeLeague?.id ?? ""}
          data={(user?.leagues as League[]).map((league) => {
            return { id: league.id, title: league.name, data: league };
          })}
          label={"Group:"}
          pressHandler={({ data }: { [key: string]: any }) => {
            dispatch({
              type: StandingsReducerAction.SET_ACTIVE_LEAGUE,
              payload: { activeLeague: data },
            });
          }}
        />

        {state.pageState !== PageState.LOADING &&
        state.pageState !== PageState.LOADING_STANDINGS ? (
          <Podium top3={state.standings.slice(0, 3)} />
        ) : (
          <View style={{ ...styles.loader, ...styles.reloader }}>
            <ActivityIndicator color={custom.colors.activeGreen} size="large" />
          </View>
        )}
      </View>
    );
  };

  const OhfersBtn = () => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Ohfers", {
            initialLeagueId: state.activeLeague?.id ?? "",
          })
        }
        style={styles.navButton}
      >
        <StyledText style={{ marginTop: Platform.OS === "android" ? 3 : 0 }}>
          {CONSTANTS.OHFER_BTN_TEXT}
        </StyledText>
        <FontAwesome name="arrow-right" color={custom.colors.textColor} />
      </TouchableOpacity>
    );
  };

  /*
    UI
  */

  if (state.pageState === PageState.LOADING) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={custom.colors.activeGreen} size="large" />
      </View>
    );
  }

  if (state.pageState === PageState.ERROR) {
    return (
      <View style={styles.errorContainer}>
        <StyledText style={styles.errorText}>{state.errorMessage}</StyledText>
      </View>
    );
  }

  if (!state.activeLeague) {
    return (
      <View style={styles.container}>
        <NoLeagueMessage />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={state.standings.slice(3)}
        ListHeaderComponent={() => <Header />}
        ListFooterComponent={() =>
          state.pageState !== PageState.LOADING_STANDINGS ? <OhfersBtn /> : null
        }
        renderItem={({ item, index }) => {
          if (state.pageState === PageState.LOADING_STANDINGS) {
            return null;
          } else {
            return (
              <StandingsRow
                contest={state.activeLeague?.contest ?? ""}
                index={index}
                user={item}
              />
            );
          }
        }}
      />
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    errorContainer: {
      alignItems: "center",
      backgroundColor: "transparent",
      marginTop: 30,
      padding: 12,
    },
    errorText: {
      textAlign: "center",
    },
    header: {
      backgroundColor: "transparent",
    },
    loader: {
      backgroundColor: "transparent",
      flex: 1,
      justifyContent: "center",
    },
    navButton: {
      alignItems: "center",
      alignSelf: "center",
      borderColor: colors.textColor,
      borderWidth: 2,
      borderRadius: 4,
      flexDirection: "row",
      height: 35,
      justifyContent: "space-around",
      marginBottom: 10,
      marginTop: 20,
      padding: 4,
      width: 125,
    },
    reloader: {
      marginTop: 50,
    },
  });
};

const CONSTANTS = {
  OHFER_BTN_TEXT: "Ohfer Weeks",
};
