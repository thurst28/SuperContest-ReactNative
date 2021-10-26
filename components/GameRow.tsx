import { useTheme } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Game,
  Team,
  CustomTheme,
  SuperContestThemeColors,
} from "../types/types";
import { StyledText } from "./StyledText";

export default ({
  activeLeagueId,
  game,
  handlePick,
}: {
  activeLeagueId: string;
  game: Game;
  handlePick: (gameId: string, opponent: Team, team: Team) => void;
}) => {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const [showAllPicks, setShowAllPicks] = useState<boolean>(false);

  const { lockTime } = game;
  const gameLocked = lockTime < Date.now();
  const gameComplete = ["COMPLETE", "RESULT"].includes(game.status);

  const TeamCard = ({
    complete,
    gameId,
    locked,
    opponent,
    result,
    spread,
    team,
  }: {
    complete: boolean;
    gameId: string;
    locked: boolean;
    opponent: Team;
    result: string;
    spread: number;
    team: Team;
  }) => {
    const textColor = team.picked
      ? custom.colors.black
      : locked
      ? custom.colors.disabledText
      : custom.colors.textColor;

    const resultText =
      result === "PUSH" ? "P" : result === team.name ? "W" : "L";

    const resultTextColor = team.picked
      ? "#000"
      : result === "PUSH"
      ? custom.colors.disabledText
      : result === team.name
      ? custom.colors.activeGreen
      : custom.colors.negative;

    const leaguePicks = useMemo(() => {
      return team.users.filter((user) => {
        return user.leagues.includes(activeLeagueId);
      });
    }, [activeLeagueId]);

    return (
      <View style={styles.teamCardView}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={locked}
          onPress={() => handlePick(gameId, opponent, team)}
          style={{
            ...styles.teamBox,
            backgroundColor: team.picked
              ? custom.colors.activeGreen
              : locked
              ? custom.colors.disabledColor
              : custom.colors.primary,
          }}
        >
          <View style={styles.resultContainer}>
            {complete && (
              <StyledText
                style={{ ...styles.resultText, color: resultTextColor }}
              >
                {resultText}
              </StyledText>
            )}
          </View>
          <View
            style={{
              ...styles.gameData,
              marginTop: Platform.OS === "android" ? 3 : 0,
            }}
          >
            <StyledText
              style={{
                ...styles.teamName,
                color: textColor,
              }}
            >
              {team.name}
            </StyledText>
            <View style={styles.spreadContainer}>
              {game.spread != 0 && (
                <StyledText
                  style={{
                    ...styles.spreadDirection,
                    color: textColor,
                  }}
                >
                  {spread > 0 ? "+" : "-"}
                </StyledText>
              )}
              <StyledText
                style={{
                  ...styles.teamSpread,
                  color: textColor,
                }}
              >
                {game.spread == 0 ? CONSTANT.PICKEM_TEXT : Math.abs(spread)}
              </StyledText>
            </View>
          </View>
        </TouchableOpacity>
        {locked ? (
          <View style={styles.nameContainer}>
            {showAllPicks || leaguePicks.length <= CONSTANT.MAX_TEAMS ? (
              <>
                {leaguePicks.map((user) => (
                  <StyledText key={user.id} style={styles.name}>
                    {user.name}
                  </StyledText>
                ))}
              </>
            ) : (
              <>
                {leaguePicks.slice(0, CONSTANT.MAX_TEAMS).map((user) => (
                  <StyledText key={user.id} style={styles.name}>
                    {user.name}
                  </StyledText>
                ))}
                <TouchableOpacity
                  onPress={() => setShowAllPicks(true)}
                  style={styles.showAllBtn}
                >
                  <StyledText style={styles.showAllBtnText}>
                    {CONSTANT.SHOW_ALL_BTN}
                  </StyledText>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.gameRow}>
      <TeamCard
        complete={gameComplete}
        gameId={game.id}
        locked={gameLocked}
        opponent={game.home}
        result={game.result}
        spread={game.spread}
        team={game.away}
      />
      <View style={styles.atContainer}>
        <StyledText style={styles.at}>@</StyledText>
      </View>
      <TeamCard
        complete={gameComplete}
        gameId={game.id}
        locked={gameLocked}
        opponent={game.away}
        result={game.result}
        spread={game.spread * -1}
        team={game.home}
      />
    </View>
  );
};

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
    at: {
      fontWeight: "bold",
    },
    atContainer: {
      justifyContent: "center",
      height: 100,
    },
    gameData: {
      height: 50,
      justifyContent: "center",
    },
    gameRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 3,
    },
    name: {
      fontSize: 12,
      margin: 0,
      lineHeight: 14,
      padding: 0,
    },
    nameContainer: {
      alignItems: "center",
      marginVertical: 5,
    },
    resultContainer: {
      alignSelf: "flex-start",
      height: 25,
    },
    resultText: {
      fontSize: 18,
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    sectionHeader: {
      alignSelf: "stretch",
      backgroundColor: colors.background,
      fontWeight: "bold",
      padding: 10,
    },
    showAllBtn: {},
    showAllBtnText: {
      fontSize: 10,
    },
    spreadContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    spreadDirection: {
      fontSize: 12,
    },
    teamBox: {
      alignItems: "center",
      backgroundColor: colors.container,
      borderRadius: 5,
      elevation: 8,
      height: 100,
    },
    teamCardView: {
      flex: 0.4,
    },
    teamName: {
      lineHeight: 22,
      fontSize: 20,
    },
    teamSpread: {
      fontSize: 18,
      textAlign: "center",
    },
  });
};

const CONSTANT = {
  MAX_TEAMS: 5,
  PICKEM_TEXT: "Pick'em!",
  SHOW_ALL_BTN: "Show all...",
};
