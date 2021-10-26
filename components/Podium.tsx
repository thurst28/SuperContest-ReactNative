import React from "react";
import {
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";

import { User, CustomTheme, SuperContestThemeColors } from "../types/types";
import { StyledText } from "./StyledText";

type PodiumProps = {
  top3: User[];
};

export default function StandingsRow({ top3 }: PodiumProps) {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);
  const navigation = useNavigation();

  const PodiumBox = ({ place, user }: { place: 1 | 2 | 3; user: User }) => {
    const placeStyles = {
      1: { ...styles.podiumBox, ...styles.podiumFirst },
      2: { ...styles.podiumBox, ...styles.podiumSecond },
      3: { ...styles.podiumBox, ...styles.podiumThird },
    };

    return (
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate("UserPicks", { userId: user.id })}
      >
        <View style={placeStyles[place]}>
          <StyledText style={{ ...styles.podiumText, ...styles.placeText }}>
            {place}
          </StyledText>
          <StyledText style={{ ...styles.podiumText, ...styles.nameText }}>
            {user?.name ?? "-"}
          </StyledText>
          <StyledText style={styles.podiumText}>
            ${user?.money?.NFL ?? 0}
          </StyledText>
          <StyledText style={styles.podiumText}>{`${user?.win?.NFL ?? 0}-${
            user?.loss?.NFL ?? 0
          }`}</StyledText>
          <View style={styles.venmoContainer}>
            <Image
              style={{ width: 12, height: 12 }}
              source={require("../assets/images/venmo.png")}
            />
            <StyledText style={{ ...styles.podiumText, ...styles.venmoText }}>
              {user?.venmo && `@${user?.venmo?.replace("@", "") ?? ""}`}
            </StyledText>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.podium}>
      <View style={styles.podiumTop}>
        <PodiumBox place={1} user={top3[0]} />
      </View>
      <View style={styles.podiumBottom}>
        <PodiumBox place={2} user={top3[1]} />
        <PodiumBox place={3} user={top3[2]} />
      </View>
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    nameText: {
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
    },
    placeText: {
      fontFamily: "SairaStencilOne_400Regular",
      fontSize: 30,
      lineHeight: 36,
      marginTop: 5,
    },
    podium: {
      backgroundColor: "transparent",
      padding: 10,
    },
    podiumBottom: {
      backgroundColor: "transparent",
      flexDirection: "row",
    },
    podiumBox: {
      alignItems: "center",
      backgroundColor: "transparent",
      borderWidth: 4,
      borderColor: colors.textColor,
      justifyContent: "space-between",
      padding: 5,
      width: "50%",
    },

    podiumFirst: {
      borderBottomWidth: 0,
    },

    podiumSecond: {
      borderRightWidth: 2,
    },
    podiumText: {
      fontWeight: "bold",
    },
    podiumThird: {
      borderLeftWidth: 2,
    },
    podiumTop: {
      backgroundColor: "transparent",
      alignItems: "center",
    },

    venmoContainer: {
      alignItems: "center",
      flexDirection: "row",
    },
    venmoText: {
      fontSize: 12,
      marginLeft: 4,
    },
  });
};
