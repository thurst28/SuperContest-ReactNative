import { RouteProp, useRoute, useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { SectionList, StyleSheet, View } from "react-native";

import { StyledText } from "../components/StyledText";
import {
  CustomTheme,
  PickData,
  SuperContestThemeColors,
  UserPickSection,
} from "../types/types";

export default function PicksByRound() {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);
  const {
    params,
  }: RouteProp<{ params: { picksByRound: PickData[][] } }, "params"> =
    useRoute();

  /*
    MEMOS
  */

  const userPickSections: UserPickSection[] = useMemo(() => {
    if (!params.picksByRound.length) {
      return [];
    }

    const filteredRounds = params.picksByRound.filter((round) => round.length);

    const sections = filteredRounds.map((round) => {
      const record = { win: 0, loss: 0, push: 0 };
      const roundNumber = round[0]?.round;
      round.forEach((game) => {
        if (game.result === CONSTS.WIN_KEY) {
          record.win += 1;
        }
        if (game.result === CONSTS.LOSS_KEY) {
          record.loss += 1;
        }
        if (game.result === CONSTS.PUSH_KEY) {
          record.push += 1;
        }
      });
      const title = `${CONSTS.ROUND_TEXT} ${roundNumber}`;
      const recordTitle = `${record.win}-${record.loss}-${record.push}`;
      return { id: roundNumber, data: round, recordTitle, title };
    });

    return sections.sort((sectionA, sectionB) => {
      return sectionB.id - sectionA.id;
    });
  }, [params.picksByRound]);

  /*
    UI
  */

  const RoundPickItem = ({ pick }: { pick: PickData }) => {
    let resultText = CONSTS.PUSH_TEXT;
    let resultTextColor = custom.colors.textColor;

    if (pick.result === CONSTS.WIN_KEY) {
      resultText = CONSTS.WIN_TEXT;
      resultTextColor = custom.colors.activeGreen;
    }

    if (pick.result === CONSTS.LOSS_KEY) {
      resultText = CONSTS.LOSS_TEXT;
      resultTextColor = custom.colors.negative;
    }

    const getSpread = () => {
      let spread = pick.spread;
      if (!pick.isAway) {
        spread = spread * -1;
      }

      if (spread === 0) {
        return CONSTS.PICK_TEXT;
      }

      if (spread > 0) {
        return `+${spread}`;
      }

      return spread;
    };

    return (
      <View style={styles.pickContainer}>
        <StyledText
          style={{ color: resultTextColor, flex: 1, fontWeight: "bold" }}
        >
          {resultText}
        </StyledText>
        <StyledText style={{ flex: 2 }}>{pick.name}</StyledText>
        <StyledText style={{ flex: 1 }}>{getSpread()}</StyledText>
        <View style={styles.opponentContainer}>
          <StyledText style={{ marginRight: 2 }}>
            {pick.isAway ? CONSTS.AT : CONSTS.VS}
          </StyledText>
          <StyledText>{pick.isAway ? pick.homeTeam : pick.awayTeam}</StyledText>
        </View>
      </View>
    );
  };

  const SectionHeader = ({
    data,
    record,
    title,
  }: {
    data: PickData[];
    record: string;
    title: string;
  }) => {
    let textColor = custom.colors.textColor;

    const cold = data.every((game) => game.result === CONSTS.LOSS_KEY);
    const gold = data.every((game) => game.result === CONSTS.WIN_KEY);

    if (cold) {
      textColor = custom.colors.negative;
    }

    if (gold) {
      textColor = custom.colors.gold;
    }

    return (
      <View style={styles.sectionTitle}>
        <StyledText style={{ ...styles.weekRecordHeader, color: textColor }}>
          {title}
        </StyledText>
        <StyledText style={{ ...styles.weekRecordTitle, color: textColor }}>
          {record}
        </StyledText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        ListFooterComponent={() => <View style={styles.spacer} />}
        sections={userPickSections}
        renderItem={({ item }) => <RoundPickItem pick={item} />}
        renderSectionHeader={({ section: { data, recordTitle, title } }) => {
          return (
            <SectionHeader data={data} record={recordTitle} title={title} />
          );
        }}
      />
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    opponentContainer: {
      flex: 2,
      flexDirection: "row",
      justifyContent: "flex-start",
    },
    pickContainer: {
      borderBottomRightRadius: 20,
      borderColor: colors.textColor,
      borderLeftWidth: 0,
      borderTopRightRadius: 20,
      borderWidth: 3,
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 2,
      marginRight: 25,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    sectionTitle: {
      alignItems: "flex-start",
      backgroundColor: colors.background,
      marginBottom: 5,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    spacer: {
      height: 500,
      width: 100,
    },

    weekRecordHeader: {
      fontSize: 16,
      fontWeight: "bold",
      width: 90,
    },
    weekRecordTitle: {},
  });
};

const CONSTS = {
  AT: "@",
  LOSS_KEY: "LOSS",
  LOSS_TEXT: "L",
  PICK_TEXT: "Pick'em!",
  PUSH_KEY: "PUSH",
  PUSH_TEXT: "P",
  ROUND_TEXT: "Round",
  WIN_KEY: "WIN",
  WIN_TEXT: "W",
  VS: "vs",
};
