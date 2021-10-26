import { FontAwesome } from "@expo/vector-icons";
import React, { useContext, useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { format } from "date-fns";
import _ from "lodash";

import { AuthContext } from "../components/AuthComposition";
import BookFilters from "../components/BookFilters";
import GameRow from "../components/GameRow";
import { NetworkContext } from "../components/NetworkComposition";
import { Text, View } from "../components/Themed";
import {
  Contest,
  GameSection,
  Round,
  HTTPAction,
  Route,
  RequestState,
  GameSet,
  Team,
  Game,
  League,
  User,
  CustomTheme,
  SuperContestThemeColors,
} from "../types/types";
import { StyledText } from "../components/StyledText";
import * as Sentry from "@sentry/react-native";
import NoLeagueMessage from "../components/NoLeagueMessage";

enum PageState {
  "LOADING",
  "LOADING_CONTEST_LIST",
  "LOADING_GAMES",
  "IDLE",
  "NO_LEAGUES",
  "RELOADING_GAMES",
  "ERROR",
}

type LocalState = {
  activeLeague: League | null;
  activeContest: Contest | null;
  contestList: Contest[];
  errorMessage: string;
  gameSections: GameSection[];
  pageState: PageState;
  pickCount: number;
  round: number;
  rounds: Round[];
  shake: boolean;
  user: User | null;
};

export enum BookReducerAction {
  SET_ACTIVE_LEAGUE,
  SET_CONTEST_LIST,
  SET_ERROR,
  SET_GAME_SECTIONS,
  SET_PICK_COUNT,
  SET_ROUND,
  SET_ROUNDS,
  SET_USER,
  TOGGLE_SHAKE,
}

export type BookReducerDispatcher =
  | {
      type: BookReducerAction.SET_ACTIVE_LEAGUE;
      payload: { data: League };
    }
  | {
      type: BookReducerAction.SET_CONTEST_LIST;
      payload: { contestList: Contest[] };
    }
  | { type: BookReducerAction.SET_ERROR; payload: { message: string } }
  | {
      type: BookReducerAction.SET_GAME_SECTIONS;
      payload: { gameSections: GameSection[] };
    }
  | { type: BookReducerAction.SET_PICK_COUNT; payload: { pickCount: number } }
  | { type: BookReducerAction.SET_ROUND; payload: { data: number } }
  | {
      type: BookReducerAction.SET_ROUNDS;
      payload: { round: number; rounds: Round[] };
    }
  | { type: BookReducerAction.SET_USER; payload: { user: User } }
  | { type: BookReducerAction.TOGGLE_SHAKE };

const initialState: LocalState = {
  activeLeague: null,
  activeContest: null,
  contestList: [],
  errorMessage: "",
  gameSections: [],
  pageState: PageState.LOADING,
  pickCount: 0,
  rounds: [],
  round: 1,
  shake: false,
  user: null,
};

function reducer(state: LocalState, action: BookReducerDispatcher): LocalState {
  switch (action.type) {
    case BookReducerAction.SET_ACTIVE_LEAGUE: {
      const newActiveLeague = action.payload.data;

      let activeContest: Contest | null = null;

      if (!_.isEmpty(state.activeLeague)) {
        const activeLeagueContest = (state.activeLeague as League).contest;
        const contest = state.contestList?.find((contest) => {
          return contest.name === activeLeagueContest;
        });
        activeContest = contest ?? null;
      }

      return {
        ...state,
        activeContest,
        activeLeague: newActiveLeague,
      };
    }

    case BookReducerAction.SET_CONTEST_LIST: {
      const { contestList }: { contestList: Contest[] } = action.payload;

      let initalActiveContest: Contest | null = null;

      if (!_.isEmpty(state.activeLeague)) {
        const activeLeagueContest = (state.activeLeague as League).contest;
        const contest = contestList?.find((contest) => {
          return contest.name === activeLeagueContest;
        });
        initalActiveContest = contest ?? null;
      }

      return {
        ...state,
        contestList,
        activeContest: initalActiveContest,
      };
    }

    case BookReducerAction.SET_ERROR: {
      return {
        ...state,
        errorMessage: action.payload.message,
        pageState: PageState.ERROR,
      };
    }
    case BookReducerAction.SET_GAME_SECTIONS: {
      const sortedSections = action.payload.gameSections.sort(
        (sectionA, sectionB) => {
          const lockTimeA = sectionA.data[0].lockTime;
          const lockTimeB = sectionB.data[0].lockTime;

          if (lockTimeA > Date.now() && lockTimeB < Date.now()) {
            return -1;
          }

          if (lockTimeA < Date.now() && lockTimeB > Date.now()) {
            return 1;
          }

          return lockTimeA - lockTimeB;
        }
      );
      return {
        ...state,
        gameSections: sortedSections,
        pageState: PageState.IDLE,
      };
    }
    case BookReducerAction.SET_PICK_COUNT: {
      return {
        ...state,
        pickCount: action.payload.pickCount,
      };
    }
    case BookReducerAction.SET_ROUND: {
      return {
        ...state,
        round: action.payload.data,
        pageState: PageState.RELOADING_GAMES,
      };
    }
    case BookReducerAction.SET_ROUNDS: {
      return {
        ...state,
        rounds: action.payload.rounds,
        round: action.payload.round,
        pageState: PageState.LOADING_GAMES,
      };
    }
    case BookReducerAction.SET_USER: {
      const { user } = action.payload;
      const activeLeague = user?.leagues?.[0] ?? {};
      return {
        ...state,
        user,
        activeLeague,
        pageState: _.isEmpty(activeLeague)
          ? PageState.NO_LEAGUES
          : PageState.LOADING_CONTEST_LIST,
      };
    }
    case BookReducerAction.TOGGLE_SHAKE: {
      return {
        ...state,
        shake: !state.shake,
      };
    }
    default: {
      return { ...state };
    }
  }
}

export default function Book() {
  const { user, userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  /*
    EFFECTS
  */

  useEffect(() => {
    if (user) {
      dispatch({ type: BookReducerAction.SET_USER, payload: { user } });
    }
  }, [user]);

  useEffect(() => {
    if (state.pageState === PageState.LOADING_CONTEST_LIST) {
      fetchContests();
    }
  }, [state.pageState]);

  useEffect(() => {
    if (_.isEmpty(state.activeContest)) {
      return;
    }

    if (
      [PageState.LOADING_GAMES, PageState.RELOADING_GAMES].includes(
        state.pageState
      )
    ) {
      fetchGames();
    }
  }, [state.round]);

  useEffect(() => {
    const { activeContest } = state;

    if (_.isEmpty(activeContest)) {
      return;
    }

    const rounds = [...Array(activeContest?.maxRounds)].map((_, i) => {
      const round = i + 1;
      return { id: String(round), title: String(round), data: round };
    });

    dispatch({
      type: BookReducerAction.SET_ROUNDS,
      payload: { rounds, round: activeContest?.round ?? 1 },
    });
  }, [state.activeContest]);

  useEffect(() => {
    let pickCount = 0;
    (state.gameSections as GameSection[]).forEach((section) => {
      section.data.forEach((game) => {
        if (game.home.picked || game.away.picked) {
          pickCount++;
        }
      });
    });

    dispatch({
      type: BookReducerAction.SET_PICK_COUNT,
      payload: { pickCount },
    });
  }, [state.gameSections]);

  useEffect(() => {
    if (state.shake) {
      setTimeout(() => {
        dispatch({ type: BookReducerAction.TOGGLE_SHAKE });
      }, 100);
    }
  }, [state.shake]);

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

    if (response.status === RequestState.ERROR) {
      dispatch({
        type: BookReducerAction.SET_ERROR,
        payload: { message: response.message },
      });
      return;
    }

    const { all }: { all: Contest[] } = response as {
      all: Contest[];
      status: RequestState.IDLE;
    };
    const userContests = (state.user as User).leagues.map(
      ({ contest }) => contest
    );
    const contestList = all.filter((contest) =>
      userContests.includes(contest.name)
    );

    dispatch({
      type: BookReducerAction.SET_CONTEST_LIST,
      payload: { contestList },
    });
  };

  const fetchGames = async () => {
    const { name } = state.activeContest as Contest;
    const parameters = { name, round: String(state.round) };

    const response = await sendNetworkRequest!(
      HTTPAction.GET,
      null,
      parameters,
      Route.GAMES,
      userToken?.token ?? ""
    );

    // ERROR
    if (response.status === RequestState.ERROR) {
      dispatch({
        type: BookReducerAction.SET_ERROR,
        payload: { message: response.message },
      });
      return;
    }

    // SUCCESS

    const gameSets: GameSet = {};

    const checkForActiveUserPick = (team: Team): number => {
      const index = team.users.findIndex(
        (pickUser: User) => pickUser.id === (state.user?.id ?? "")
      );
      if (index !== -1) {
        team.picked = true;
        return 1;
      }
      return 0;
    };

    let currentPickCount = 0;

    (response.games as Game[]).forEach((game: Game) => {
      const { time } = game;

      // see if active user picked team
      const awayCount = checkForActiveUserPick(game.away);
      const homeCount = checkForActiveUserPick(game.home);

      currentPickCount = currentPickCount + awayCount + homeCount;

      if (!gameSets[time]) {
        // create new set for unique time
        const displayDate = format(time, BookConstants.DATE_FORMAT);
        const lockTime = game.lockTime;

        gameSets[String(time)] = {
          games: [game],
          displayDate,
          lockTime,
        };
      } else {
        // Add game to exisiting set
        gameSets[time].games.push(game);
      }
    });

    const gameSections = Object.entries(gameSets).map(([_, value]) => {
      return {
        title: value.displayDate,
        data: value.games,
      };
    });

    dispatch({
      type: BookReducerAction.SET_GAME_SECTIONS,
      payload: { gameSections },
    });
  };

  const addPickRequest = async (gameId: string, team: Team) => {
    const response = await sendNetworkRequest!(
      HTTPAction.PATCH,
      { teamId: team.id, gameId },
      null,
      Route.ADD_PICK,
      userToken?.token ?? ""
    );

    if (response.status === RequestState.ERROR) {
      Alert.alert(BookConstants.ERROR_ALERT_TEXT, response.message, [
        { text: BookConstants.ERROR_ALERT_BTN_TEXT },
      ]);

      team.picked = false;

      dispatch({
        type: BookReducerAction.SET_GAME_SECTIONS,
        payload: { gameSections: [...state.gameSections] },
      });
      return;
    }
  };

  const removePickRequest = async (
    gameId: string,
    team: Team,
    opponent?: Team
  ) => {
    const response = await sendNetworkRequest!(
      HTTPAction.PATCH,
      { teamId: team.id, gameId },
      null,
      Route.REMOVE_PICK,
      userToken?.token ?? ""
    );

    if (response.status === RequestState.ERROR) {
      Alert.alert(BookConstants.ERROR_ALERT_TEXT, response.message, [
        { text: BookConstants.ERROR_ALERT_BTN_TEXT },
      ]);

      team.picked = true;

      if (opponent) {
        opponent.picked = false;
      }
      dispatch({
        type: BookReducerAction.SET_GAME_SECTIONS,
        payload: { gameSections: [...state.gameSections] },
      });
      return;
    }
  };

  /*
     HANDLERS
  */

  const handlePick = (gameId: string, opponent: Team, team: Team) => {
    if (team.picked) {
      team.picked = false;
      removePickRequest(gameId, team);
      dispatch({
        type: BookReducerAction.SET_GAME_SECTIONS,
        payload: { gameSections: [...state.gameSections] },
      });
      return;
    }

    if (opponent.picked) {
      opponent.picked = false;
      team.picked = true;
      removePickRequest(gameId, opponent, team);
      addPickRequest(gameId, team);
    } else if (state.pickCount < 5) {
      team.picked = true;
      addPickRequest(gameId, team);
    } else {
      dispatch({ type: BookReducerAction.TOGGLE_SHAKE });
    }

    dispatch({
      type: BookReducerAction.SET_GAME_SECTIONS,
      payload: { gameSections: [...state.gameSections] },
    });
  };

  /*
    UI
  */

  const SectionHeader = ({ section }: { section: GameSection }) => {
    const { data, title } = section;

    const isLocked = data[0].lockTime < Date.now();

    return (
      <StyledText
        style={{
          ...styles.sectionHeader,
          color: isLocked
            ? custom.colors.disabledText
            : custom.colors.textColor,
        }}
      >
        {title}
        {` `}
        {isLocked && (
          <FontAwesome
            name={"lock"}
            color={custom.colors.disabledText}
            size={16}
          />
        )}
      </StyledText>
    );
  };

  if (
    [
      PageState.LOADING,
      PageState.LOADING_GAMES,
      PageState.LOADING_CONTEST_LIST,
    ].includes(state.pageState)
  ) {
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

  if (state.pageState === PageState.NO_LEAGUES || !state.activeLeague) {
    return (
      <View style={styles.container}>
        <NoLeagueMessage />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BookFilters
        activeLeague={state.activeLeague!}
        activeRound={state.round}
        dispatch={dispatch}
        pickCount={state.pickCount}
        rounds={state.rounds}
        shake={state.shake}
        user={state.user!}
      />
      <SectionList
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <StyledText style={styles.noGamesMessage}>
            {BookConstants.NO_GAME_MESSAGE}
          </StyledText>
        }
        ListFooterComponent={() => <View style={styles.bottomPadding}></View>}
        renderItem={({ item, index, section }) => {
          if (state.pageState === PageState.RELOADING_GAMES) {
            const isFirstSection =
              index === 0 && state.gameSections[0].title === section.title;

            return isFirstSection ? (
              <View style={styles.reloader}>
                <ActivityIndicator
                  color={custom.colors.activeGreen}
                  size="large"
                />
              </View>
            ) : null;
          } else {
            return (
              <GameRow
                activeLeagueId={state.activeLeague?.id ?? ""}
                game={item}
                handlePick={handlePick}
              />
            );
          }
        }}
        renderSectionHeader={({ section }) => {
          return state.pageState !== PageState.RELOADING_GAMES ? (
            <SectionHeader section={section} />
          ) : null;
        }}
        sections={state.gameSections}
      />
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    at: {
      alignSelf: "center",
      fontWeight: "bold",
    },
    bottomPadding: {
      backgroundColor: "transparent",
      height: 20,
    },
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
    errorText: { textAlign: "center" },
    loader: {
      backgroundColor: "transparent",
      flex: 1,
      justifyContent: "center",
    },
    noGamesMessage: {
      alignSelf: "center",
    },
    reloader: {
      backgroundColor: "transparent",
      paddingVertical: 50,
    },
    sectionHeader: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.background,

      fontWeight: "bold",
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
  });
};

const BookConstants = {
  DATE_FORMAT: "E, MMM d h:mm aaa",
  ERROR_ALERT_BTN_TEXT: "ok",
  ERROR_ALERT_TEXT: "Something went wrong",
  NO_GAME_MESSAGE: "No games yet for this round",
  SPINNER_HEIGHT: 200,
  SPINNER_WIDTH: 200,
};
