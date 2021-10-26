import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Picker from "./Picker";
import PickCounter from "./PickCounter";
import { BookReducerAction, BookReducerDispatcher } from "../screens/Book";
import {
  Contest,
  CustomTheme,
  League,
  Round,
  SuperContestThemeColors,
  User,
} from "../types/types";
import { StyledText } from "./StyledText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

type BookFiltersProps = {
  activeLeague: League;
  activeRound: number;
  dispatch: React.Dispatch<BookReducerDispatcher>;
  pickCount: number;
  rounds: Round[];
  shake: boolean;
  user: User;
};

export default function BookFilters({
  activeLeague,
  activeRound,
  dispatch,
  pickCount,
  rounds,
  shake,
  user,
}: BookFiltersProps) {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);
  const [hidden, setHidden] = useState(false);

  const scrollRef = useRef<ScrollView>();

  useEffect(() => {
    (scrollRef as React.MutableRefObject<ScrollView>).current.scrollTo({
      x: (activeRound - 1) * 86,
      animated: false,
    });
  }, []);

  return (
    <View style={styles.filters}>
      {!hidden ? (
        <>
          <Picker
            activeId={activeLeague.id}
            data={(user?.leagues as League[]).map((league) => {
              return { id: league.id, title: league.name, data: league };
            })}
            label={BookFilterConstants.GROUP_LABEL}
            pressHandler={({ data }: { data: { [key: string]: any } }) => {
              dispatch({
                type: BookReducerAction.SET_ACTIVE_LEAGUE,
                payload: { data },
              } as BookReducerDispatcher);
            }}
          />

          <View style={styles.picker}>
            <StyledText style={styles.pickerLabel}>
              {BookFilterConstants.ROUND_LABEL}
            </StyledText>
            <ScrollView
              horizontal={true}
              ref={scrollRef as React.MutableRefObject<ScrollView>}
              showsHorizontalScrollIndicator={false}
            >
              {rounds.map((round) => {
                const fillColor =
                  round.data == activeRound
                    ? custom.colors.textColor
                    : "transparent";
                const textColor =
                  round.data == activeRound
                    ? custom.colors.background
                    : custom.colors.textColor;
                const borderWidth = round.data == activeRound ? 0 : 1;
                return (
                  <TouchableOpacity
                    onPress={() =>
                      dispatch({
                        type: BookReducerAction.SET_ROUND,
                        payload: { data: round.data },
                      } as BookReducerDispatcher)
                    }
                    key={round.id}
                    style={{
                      ...styles.pickerItemBtn,
                      backgroundColor: fillColor,
                      borderWidth,
                    }}
                  >
                    <StyledText
                      style={{ ...styles.pickerItemText, color: textColor }}
                    >
                      {round.title}
                    </StyledText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <View style={styles.userNumbers}>
            <StyledText style={styles.record}>{`${
              user?.win?.[activeLeague.contest] ?? 0
            }-${user?.loss?.[activeLeague.contest] ?? 0}`}</StyledText>
            <PickCounter max={5} pickCount={pickCount} startShake={shake} />
          </View>
        </>
      ) : null}
      <View style={styles.closeBtnContainer}>
        <TouchableWithoutFeedback
          onPress={() => setHidden(!hidden)}
          style={styles.closeBtn}
        >
          <FontAwesome
            name={hidden ? "chevron-down" : "chevron-up"}
            color={custom.colors.textColor}
            size={16}
          />
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.separator} />
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    closeBtn: {
      alignItems: "center",
      height: 45,
      justifyContent: "center",
      width: 45,
    },
    closeBtnContainer: {
      alignItems: "center",
    },
    filters: {
      backgroundColor: "transparent",
    },
    picker: {
      alignItems: "center",
      backgroundColor: "transparent",
      flexDirection: "row",
      height: 50,
      justifyContent: "center",
      paddingLeft: 5,
    },
    pickerItemBtn: {
      alignItems: "center",
      borderColor: colors.textColor,
      borderRadius: 50,
      borderWidth: 1,
      height: 30,
      justifyContent: "center",
      margin: 3,
      padding: 4,
      minWidth: 80,
    },
    pickerItemText: {
      fontSize: 14,
      lineHeight: 16,
      marginTop: 3,
    },
    pickerLabel: {
      fontSize: 12,
      fontWeight: "bold",
      marginRight: 5,
      textAlign: "right",
      width: 55,
    },
    record: {
      fontWeight: "bold",
    },
    separator: {
      alignSelf: "center",
      marginVertical: 3,
      backgroundColor: colors.textColor,
      height: 1,
      width: "80%",
    },
    userNumbers: {
      alignItems: "center",
      backgroundColor: "transparent",
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 3,
    },
  });
};

const BookFilterConstants = {
  CONTEST_LABEL: "Contest:",
  GROUP_LABEL: "Group:",
  ROUND_LABEL: "Round:",
};
