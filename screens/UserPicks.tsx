import { FontAwesome } from "@expo/vector-icons";
import {
  RouteProp,
  useNavigation,
  useRoute,
  useTheme,
} from "@react-navigation/native";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { AuthContext } from "../components/AuthComposition";
import { NetworkContext } from "../components/NetworkComposition";
import Picker from "../components/Picker";
import { StyledText } from "../components/StyledText";
import {
  CustomTheme,
  HTTPAction,
  RequestState,
  Route,
  SuperContestThemeColors,
  User,
  UserPicks,
} from "../types/types";

enum PageState {
  LOADING,
  IDLE,
  ERROR,
}

type PickerObject = {
  id: string;
  title: string;
  data: { id: string };
};

export default function UserPicksCompontent() {
  const { userToken } = useContext(AuthContext);
  const { sendNetworkRequest } = useContext(NetworkContext);
  const navigation = useNavigation();
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);
  const { params }: RouteProp<{ params: { userId: string } }, "params"> =
    useRoute();

  const [activeContest, setActiveContest] = useState("");
  const [error, setError] = useState("");
  const [pageState, setPageState] = useState(PageState.LOADING);
  const [userDetails, setUserDetails] = useState<User | null>();
  const [userPicks, setUserPicks] = useState<UserPicks | null>();

  /*
    MEMOS
  */

  const userContests = useMemo(() => {
    const contests: PickerObject[] = [];
    userDetails?.leagues.forEach((league) => {
      const { contest } = league;
      const index = contests.findIndex(
        (storedContest) => contest === storedContest.id
      );
      if (!contests.length || index === -1) {
        contests.push({ id: contest, title: contest, data: { id: contest } });
      }
    });

    setActiveContest(contests[0]?.id ?? "");
    return contests;
  }, [userDetails]);

  /*
    EFFECTS
  */

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (activeContest) {
      getUserPicks();
    }
  }, [activeContest]);

  /*
    NETWORK
  */

  const getUser = async () => {
    const response = await sendNetworkRequest!(
      HTTPAction.GET,
      null,
      null,
      `${Route.USER_DETAILS}/${params.userId}`,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      console.log("Error on user call");
      setPageState(PageState.ERROR);
      setError(response.message);

      return;
    }

    // SUCCESS

    const user = response as unknown as User;

    setUserDetails(user as User);
  };

  const getUserPicks = async () => {
    const response = await sendNetworkRequest!(
      HTTPAction.GET,
      null,
      { contest: activeContest },
      `${Route.USER_PICKS}/${params.userId}`,
      userToken?.token ?? ""
    );

    // ERROR

    if (response.status === RequestState.ERROR) {
      console.log("Error on user call");
      setPageState(PageState.ERROR);
      setError(response.message);

      return;
    }

    // SUCCESS

    const userPicks = response as unknown as UserPicks;

    setUserPicks(userPicks);
    setPageState(PageState.IDLE);
  };

  /*
    UTILS
  */

  const getPercent = (losses: number, wins: number): string => {
    if (wins === 0) {
      return "0";
    }
    return ((wins / (wins + losses)) * 100).toFixed(0);
  };

  /*
    UI
  */

  // LOADING

  if (pageState === PageState.LOADING) {
    return (
      <View style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator color={custom.colors.activeGreen} size="large" />
        </View>
      </View>
    );
  }

  // ERROR

  if (pageState === PageState.ERROR || !userDetails || !userPicks) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <StyledText style={styles.errorText}>{error}</StyledText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.nameContainer}>
        <StyledText style={styles.name}>{userDetails.name}</StyledText>
        <View style={styles.venmoContainer}>
          <Image
            style={{ width: 12, height: 12 }}
            source={require("../assets/images/venmo.png")}
          />
          <StyledText style={styles.venmoText}>{`@${userDetails.venmo?.replace(
            "@",
            ""
          )}`}</StyledText>
        </View>
      </View>
      <Picker
        activeId={activeContest}
        data={userContests}
        label={CONSTS.CONTEST_LABEL}
        pressHandler={({ data }: { data: { id: string } }) =>
          setActiveContest(data.id)
        }
      />
      <View style={styles.recordContainer}>
        <View style={styles.recordRow}>
          <View style={styles.singleRecord}>
            <StyledText style={styles.recordLabel}>
              {CONSTS.OVERALL_LABEL}
            </StyledText>
            <StyledText
              style={styles.record}
            >{`${userPicks.record.win}-${userPicks.record.loss}-${userPicks.record.push}`}</StyledText>
            <StyledText style={styles.percentage}>
              {getPercent(userPicks.record.loss, userPicks.record.win)}%
            </StyledText>
          </View>
        </View>
        <View style={styles.recordRow}>
          <View style={styles.singleRecord}>
            <StyledText style={styles.recordLabel}>
              {CONSTS.HOME_LABEL}
            </StyledText>
            <StyledText
              style={styles.record}
            >{`${userPicks.homeAwayRecord.home.win}-${userPicks.homeAwayRecord.home.loss}-${userPicks.homeAwayRecord.home.push}`}</StyledText>
            <StyledText style={styles.percentage}>
              {getPercent(
                userPicks.homeAwayRecord.home.loss,
                userPicks.homeAwayRecord.home.win
              )}
              %
            </StyledText>
          </View>
          <View style={styles.singleRecord}>
            <StyledText style={styles.recordLabel}>
              {CONSTS.AWAY_LABEL}
            </StyledText>
            <StyledText
              style={styles.record}
            >{`${userPicks.homeAwayRecord.away.win}-${userPicks.homeAwayRecord.away.loss}-${userPicks.homeAwayRecord.away.push}`}</StyledText>
            <StyledText style={styles.percentage}>
              {getPercent(
                userPicks.homeAwayRecord.away.loss,
                userPicks.homeAwayRecord.away.win
              )}
              %
            </StyledText>
          </View>
        </View>
        <View style={styles.recordRow}>
          <View style={styles.singleRecord}>
            <StyledText style={styles.recordLabel}>
              {CONSTS.FAVORITE_LABEL}
            </StyledText>
            <StyledText
              style={styles.record}
            >{`${userPicks.favoriteUnderdogRecord.favorite.win}-${userPicks.favoriteUnderdogRecord.favorite.loss}-${userPicks.favoriteUnderdogRecord.favorite.push}`}</StyledText>
            <StyledText style={styles.percentage}>
              {getPercent(
                userPicks.favoriteUnderdogRecord.favorite.loss,
                userPicks.favoriteUnderdogRecord.favorite.win
              )}
              %
            </StyledText>
          </View>
          <View style={styles.singleRecord}>
            <StyledText style={styles.recordLabel}>
              {CONSTS.DOG_LABEL}
            </StyledText>
            <StyledText
              style={styles.record}
            >{`${userPicks.favoriteUnderdogRecord.dog.win}-${userPicks.favoriteUnderdogRecord.dog.loss}-${userPicks.favoriteUnderdogRecord.dog.push}`}</StyledText>
            <StyledText style={styles.percentage}>
              {getPercent(
                userPicks.favoriteUnderdogRecord.dog.loss,
                userPicks.favoriteUnderdogRecord.dog.win
              )}
              %
            </StyledText>
          </View>
        </View>
      </View>
      <View style={styles.weekRecordContainer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PicksByRound", {
              picksByRound: userPicks.picksByRound,
            })
          }
          style={styles.navButton}
        >
          <StyledText style={{ marginTop: Platform.OS === "android" ? 3 : 0 }}>
            Picks By Round
          </StyledText>
          <FontAwesome name="arrow-right" color={custom.colors.textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      flex: 1,
      paddingVertical: 10,
    },
    errorContainer: {
      backgroundColor: colors.negative,
      borderRadius: 5,
      margin: 10,
      marginTop: 50,
      padding: 10,
    },
    errorText: {
      color: "#000",
    },
    loader: {
      marginTop: 50,
    },
    name: {
      fontSize: 20,
      fontWeight: "bold",
    },
    nameContainer: {
      alignItems: "center",
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
      width: 150,
    },
    percentage: {},
    record: {
      fontSize: 20,
      fontWeight: "bold",
    },
    recordContainer: {
      alignItems: "center",
      backgroundColor: colors.container,
      borderRadius: 5,
      marginTop: 15,
      padding: 5,
      width: "90%",
    },
    recordLabel: {
      fontSize: 12,
    },
    recordRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "80%",
    },

    singleRecord: {
      alignItems: "center",
      flex: 1,
      marginVertical: 5,
    },

    venmoContainer: {
      alignItems: "center",
      flexDirection: "row",
    },
    venmoText: {
      marginLeft: 4,
    },
    weekRecordContainer: {
      marginTop: 10,
      width: "100%",
    },
  });
};

const CONSTS = {
  AWAY_LABEL: "Away Teams",
  CONTEST_LABEL: "Contest",
  DOG_LABEL: "Dogs",
  FAVORITE_LABEL: "Favorites",
  HOME_LABEL: "Home Teams",
  OVERALL_LABEL: "Overall",
};
