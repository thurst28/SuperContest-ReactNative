import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RouteProp, useRoute, useTheme } from "@react-navigation/native";

import { AuthContext } from "../components/AuthComposition";
import { NetworkContext } from "../components/NetworkComposition";
import Picker from "../components/Picker";
import {
  CustomTheme,
  Game,
  HTTPAction,
  League,
  RequestState,
  Route,
  SuperContestThemeColors,
} from "../types/types";
import { StyledText } from "../components/StyledText";

enum PageState {
  "LOADING",
  "RELOADING",
  "IDLE",
  "ERROR",
}

type OhferWeek = {
  cold: boolean;
  games: Game[];
  gold: boolean;
  id: string;
  round: number;
  userName: string;
};

export default function Ohfers() {
  const { user, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const {
    params,
  }: RouteProp<{ params: { initialLeagueId: string } }, "params"> = useRoute();

  const [errorMessage, setErrorMessage] = useState("");
  const [activeLeagueId, setActiveLeagueId] = useState("");
  const [pageState, setPageState] = useState(PageState.LOADING);
  const [ohfers, setOhfers] = useState([]);

  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  useEffect(() => {
    setActiveLeagueId(params.initialLeagueId);
  }, []);

  useEffect(() => {
    if (activeLeagueId) {
      fetchOhfers();
    }
  }, [activeLeagueId]);

  /*
    NETWORK
  */

  const fetchOhfers = async () => {
    const response = await sendNetworkRequest!(
      HTTPAction.GET,
      null,
      {
        leagueId: activeLeagueId,
      },
      Route.OHFER_WEEKS,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      setErrorMessage(response.message);
      setPageState(PageState.ERROR);
      return;
    }

    // SUCCESS

    const ohfers = response.ohfers;
    setOhfers(ohfers);
    setPageState(PageState.IDLE);
  };

  /*
    UI
  */

  const OhferWeek = ({ week }: { week: OhferWeek }) => {
    const background = week.gold
      ? "rgba(230, 164, 0, 1)"
      : "rgba(238, 153, 160, 1)";
    return (
      <View
        style={{ ...styles.ohferWeekContainer, backgroundColor: background }}
      >
        <StyledText style={{ ...styles.ohferText, ...styles.ohferName }}>
          {week.userName}
        </StyledText>
        <StyledText style={{ ...styles.ohferText, ...styles.ohferRound }}>
          {CONSTANTS.ROUND} {week.round}
        </StyledText>
        <StyledText style={styles.ohferText}>
          {week.gold ? `${week.games.length}-0` : `0-${week.games.length}`}
        </StyledText>
      </View>
    );
  };

  const EmptyMessage = () => {
    return (
      <View>
        <StyledText style={styles.emptyText}>
          {CONSTANTS.EMPTY_MESSAGE}
        </StyledText>
      </View>
    );
  };

  if (pageState === PageState.LOADING) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={custom.colors.activeGreen} size="large" />
      </View>
    );
  }

  if (pageState === PageState.ERROR) {
    return (
      <View style={styles.errorContainer}>
        <StyledText style={styles.errorText}>{errorMessage}</StyledText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        activeId={activeLeagueId ?? ""}
        data={(user?.leagues as League[]).map((league) => {
          return { id: league.id, title: league.name, data: league };
        })}
        label={"Group:"}
        pressHandler={({ data }: { [key: string]: any }) => {
          setPageState(PageState.RELOADING);
          setActiveLeagueId(data.id);
        }}
      />
      {pageState === PageState.RELOADING ? (
        <View style={styles.loader}>
          <ActivityIndicator color={custom.colors.activeGreen} size="large" />
        </View>
      ) : (
        <FlatList
          data={ohfers}
          ListEmptyComponent={() => <EmptyMessage />}
          renderItem={({ item }) => <OhferWeek week={item} />}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
      marginTop: 10,
    },
    emptyContainer: {
      alignItems: "center",
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
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
    loader: {
      backgroundColor: "transparent",
      flex: 1,
      justifyContent: "center",
    },
    ohferWeekContainer: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 20,
      borderColor: colors.textColor,
      borderLeftWidth: 0,
      borderTopRightRadius: 20,
      borderWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-start",
      marginVertical: 5,
      marginRight: 25,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    ohferRound: {
      width: "25%",
    },
    ohferName: {
      fontWeight: "bold",
      width: "40%",
    },

    ohferText: {
      color: "#000",
    },
  });
};

const CONSTANTS = {
  EMPTY_MESSAGE: "No Ohfer Weeks",
  ROUND: "round:",
};
