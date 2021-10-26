import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomTheme, League, SuperContestThemeColors } from "../types/types";
import { StyledText } from "./StyledText";

type BubbleProps = {
  item: PickerData;
};

type PickerData = {
  id: string;
  title: string;
  data: League | { id: number | string };
};

type PickerProps = {
  activeId: string;
  data: PickerData[];
  label: string;
  pressHandler: any;
};

export default function Picker({
  activeId,
  data,
  label,
  pressHandler,
}: PickerProps) {
  const { custom } = useTheme() as CustomTheme;
  const styles = makeStyles(custom.colors);

  const Bubble = ({ item }: BubbleProps) => {
    const active = item.id == activeId;
    const borderWidth = active ? 0 : 1;
    const fillColor = active ? custom.colors.textColor : "transparent";
    const textColor = active
      ? custom.colors.background
      : custom.colors.textColor;

    return (
      <TouchableOpacity
        onPress={() => pressHandler({ data: item.data })}
        style={{
          ...styles.pickerItemBtn,
          backgroundColor: fillColor,
          borderWidth,
        }}
      >
        <StyledText
          style={{
            ...styles.pickerItemText,
            color: textColor,
            marginTop: Platform.OS === "android" ? 3 : 0,
          }}
        >
          {item.title}
        </StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.picker}>
      <StyledText style={styles.pickerLabel}>{label}</StyledText>
      <FlatList
        data={data}
        horizontal={true}
        renderItem={({ item }) => <Bubble item={item} />}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const makeStyles = (colors: SuperContestThemeColors) => {
  return StyleSheet.create({
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
      paddingHorizontal: 10,
      minWidth: 80,
    },
    pickerItemText: {
      fontSize: 14,
    },
    pickerLabel: {
      fontSize: 12,
      fontWeight: "bold",
      marginRight: 5,
      textAlign: "right",
      width: 55,
    },
  });
};
