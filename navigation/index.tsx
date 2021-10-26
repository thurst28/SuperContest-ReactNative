/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { ColorSchemeName } from "react-native";

import Login from "../screens/Login";
import ModalScreen from "../screens/ModalScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import Book from "../screens/Book";
import LinkingConfiguration from "./LinkingConfiguration";
import Standings from "../screens/Standings";
import {
  RootStackParamList,
  RootTabParamList,
  RootTabScreenProps,
} from "../types/types";
import { AuthContext } from "../components/AuthComposition";
import CreateLeague from "../screens/CreateLeague";
import JoinLeague from "../screens/JoinLeague";
import Ohfers from "../screens/Ohfers";
import User from "../screens/User";
import UserPicks from "../screens/UserPicks";
import PicksByRound from "../screens/PicksByRound";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  const { appearance } = useContext(AuthContext);

  const myDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
    },
    custom: {
      colors: {
        ...DarkTheme.colors,
        activeGreen: "#03DAC6",
        black: "#0e1111",
        container: "#1c1c1e",
        disabledColor: "#2e2e2e",
        disabledText: "#777777",
        gold: "#e6a400",
        light: "#f8f8ff",
        lightBlue: "#8cabd9",
        negative: "#ee99a0",
        textColor: "#93cddd",
        primary: "#1d2a5d",
      },
    },
  };

  const myLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
    },
    custom: {
      colors: {
        ...DefaultTheme.colors,
        activeGreen: "#08e2a1",
        black: "#0e1111",
        container: "#fff",
        disabledColor: "#D5D5D5",
        disabledText: "#adadad",
        gold: "#a87905",
        light: "#f8f8ff",
        lightBlue: "#8cabd9",
        negative: "#d41727",
        textColor: "#1d2a5d",
        primary: "#badfe9",
      },
    },
  };

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={
        appearance === "LIGHT"
          ? myLightTheme
          : appearance === "DARK"
          ? myDarkTheme
          : colorScheme === "dark"
          ? myDarkTheme
          : myLightTheme
      }
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen
          name="Auth"
          component={Login}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Root"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotFound"
            component={NotFoundScreen}
            options={{ title: "Oops!" }}
          />
          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen name="Modal" component={ModalScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 *
 *
 */

const BookStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Book" component={Book} options={{ title: "Book" }} />
      <Stack.Screen
        name="CreateLeague"
        component={CreateLeague}
        options={{ title: "Create League" }}
      />
      <Stack.Screen
        name="JoinLeague"
        component={JoinLeague}
        options={{ title: "Join League" }}
      />
    </Stack.Navigator>
  );
};

const StandingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Standings"
        component={Standings}
        options={{ title: "Standings" }}
      />
      <Stack.Screen name="Ohfers" component={Ohfers} />
      <Stack.Screen
        name="UserPicks"
        component={UserPicks}
        options={{ title: "User Picks" }}
      />
      <Stack.Screen
        name="PicksByRound"
        component={PicksByRound}
        options={{ title: "Picks by Round" }}
      />
      <Stack.Screen
        name="CreateLeague"
        component={CreateLeague}
        options={{ title: "Create League" }}
      />
      <Stack.Screen
        name="JoinLeague"
        component={JoinLeague}
        options={{ title: "Join League" }}
      />
    </Stack.Navigator>
  );
};

const UserStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="User"
        component={User}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="CreateLeague"
        component={CreateLeague}
        options={{ title: "Create League" }}
      />
      <Stack.Screen
        name="JoinLeague"
        component={JoinLeague}
        options={{ title: "Join League" }}
      />
    </Stack.Navigator>
  );
};

const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  return (
    <BottomTab.Navigator initialRouteName="Book" screenOptions={{}}>
      <BottomTab.Screen
        name="Book"
        component={BookStack}
        options={({ navigation }: RootTabScreenProps<"Book">) => ({
          headerShown: false,
          title: "Book",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        })}
      />
      <BottomTab.Screen
        name="Leagues"
        component={StandingsStack}
        options={({ navigation }: RootTabScreenProps<"Leagues">) => ({
          headerShown: false,
          title: "Standings",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="list-ol" color={color} />
          ),
        })}
      />
      <BottomTab.Screen
        name="Settings"
        component={UserStack}
        options={({ navigation }: RootTabScreenProps<"Settings">) => ({
          headerShown: false,
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        })}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
