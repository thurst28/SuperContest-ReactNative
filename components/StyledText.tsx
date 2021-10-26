import React, { ReactNode } from "react";
import { useTheme } from "@react-navigation/native";
import { CustomTheme } from "../types/types";

import { Text } from "./Themed";

type StyledTextProps = {
  style?: { [key: string]: string | number };
  children: ReactNode;
};

export function StyledText({ children, style }: StyledTextProps) {
  const { custom } = useTheme() as CustomTheme;

  const fontFamily =
    style?.fontWeight === "bold" ? "Poppins_700Bold" : "Poppins_400Regular";

  return (
    <Text
      style={{
        color: custom.colors.textColor,
        fontFamily: fontFamily,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
