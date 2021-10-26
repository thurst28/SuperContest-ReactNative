import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";

import { User, SuperContestThemeColors, CustomTheme } from "../types/types";
import { StyledText } from "./StyledText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

type StandingsRowProps = {
  contest: string;
  index: number;
  user: User;
};

const PLACE_MODIFIER = 4;

export default function StandingsRow({
  contest,
  index,
  user,
}: StandingsRowProps) {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);
  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback
      onPress={() => navigation.navigate("UserPicks", { userId: user.id })}
      style={styles.row}
    >
      <StyledText style={{ ...styles.column, ...styles.placeText }}>
        {index + PLACE_MODIFIER}
      </StyledText>
      <View style={{ ...styles.column, ...styles.nameContainer }}>
        <StyledText style={styles.nameText}>{user.name.trim()}</StyledText>
        <View style={styles.venmoContainer}>
          <Image
            style={{ width: 12, height: 12 }}
            source={require("../assets/images/venmo.png")}
          />
          <StyledText style={styles.venmoText}>{`@${user.venmo?.replace(
            "@",
            ""
          )}`}</StyledText>
        </View>
      </View>
      <StyledText style={styles.column}>
        ${user.money?.[contest] ?? 0}
      </StyledText>
      <StyledText>{`${user.win?.[contest] ?? 0}-${
        user.loss?.[contest] ?? 0
      }`}</StyledText>
    </TouchableWithoutFeedback>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    column: {
      alignItems: "center",

      marginHorizontal: 4,
      width: "15%",
    },
    nameContainer: {
      alignItems: "flex-start",
      width: "60%",
    },
    nameText: {
      fontWeight: "bold",
    },
    placeText: {
      fontWeight: "bold",
      alignItems: "center",
      width: "5%",
    },
    row: {
      alignItems: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.textColor,
      borderLeftWidth: 0,
      borderBottomRightRadius: 20,
      borderTopRightRadius: 20,
      flexDirection: "row",
      flex: 1,

      marginRight: 10,
      marginVertical: 4,
      paddingHorizontal: 10,
      paddingVertical: 10,
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
