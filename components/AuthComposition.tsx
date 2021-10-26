import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { networkRequest } from "./NetworkComposition";
import {
  CustomTheme,
  HTTPAction,
  League,
  RequestState,
  Route,
  User,
} from "../types/types";
import { useTheme } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { reportToSentry } from "../utils/reportToSentry";
import { THEME_STORAGE_KEY } from "./Appearance";

type AuthContextType = {
  addLeague: (league: League) => void;
  appearance: string;
  changeAppearance: (appearance: string) => void;
  devicePushToken: string | null;
  logout: () => void;
  removeLeague: (leagueId: string) => void;
  setUser:
    | Dispatch<SetStateAction<User | null>>
    | ((user: User | null) => void);
  setUserToken:
    | Dispatch<SetStateAction<UserToken | null>>
    | ((userToken: UserToken | null) => void);
  user: User | null;
  userToken: UserToken | null;
};

type UserToken = {
  id: string;
  token: string;
};

enum AuthState {
  LOADING,
  LOGGED_IN,
  LOGGED_OUT,
}

export const AuthContext = createContext<AuthContextType>({
  addLeague: (league: League) => {},
  appearance: "DEVICE",
  changeAppearance: (appearance: string) => {},
  devicePushToken: null,
  logout: () => {},
  removeLeague: (leagueId: string) => {},
  setUser: (user: User | null) => {},
  setUserToken: (userToken: UserToken | null) => {},
  user: null,
  userToken: null,
});

export default ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState(AuthState.LOADING);
  const [appearance, setAppearance] = useState("DEVICE");
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<UserToken | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getStoredUser = async () => {
      let storedUserToken;
      let storedAppearance;

      try {
        storedUserToken = await SecureStore.getItemAsync(CONSTANT.TOKEN_KEY);
        storedAppearance =
          (await AsyncStorage.getItem(THEME_STORAGE_KEY)) ?? "DEVICE";

        if (!storedUserToken) {
          setAuthState(AuthState.LOGGED_OUT);
          return;
        }

        storedUserToken = JSON.parse(storedUserToken ?? "");
        setUserToken(storedUserToken);
        setAppearance(storedAppearance);
      } catch (error) {
        // Restoring token failed

        reportToSentry(error, "STORED USER ERROR");
      }
    };

    getStoredUser();
  }, []);

  useEffect(() => {
    const storeUser = async () => {
      await SecureStore.setItemAsync(
        CONSTANT.TOKEN_KEY,
        JSON.stringify(userToken)
      );
    };

    const getUser = async () => {
      const rawResponse = await networkRequest(
        HTTPAction.GET,
        null,
        null,
        `${Route.USER}/${userToken?.id}`,
        userToken?.token ?? ""
      );

      const response = await rawResponse.json();

      // ERROR

      if (!rawResponse.ok) {
        console.log("Error on user call");
        setUser(null);
        setAuthState(AuthState.LOGGED_OUT);
        return;
      }

      // SUCCESS

      setUser(response);
      setAuthState(AuthState.LOGGED_IN);
    };

    if (userToken) {
      storeUser();

      if (!user) {
        getUser();
      }
    }
  }, [userToken]);

  useEffect(() => {
    if (user) {
      registerForPushNotifications();
    }
  }, [user]);

  const registerForPushNotifications = async () => {
    let token;
    try {
      if (Constants.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notification!");
          return;
        }
        const tokenRes = await Notifications.getExpoPushTokenAsync();

        token = tokenRes.data;
        setDevicePushToken(token);

        Sentry.captureMessage(JSON.stringify(token));

        if (user?.pushTokens.includes(token)) {
          return;
        }

        if (Platform.OS === "android") {
          Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }

        await networkRequest(
          HTTPAction.PUT,
          { pushToken: token },
          null,
          `${Route.PUSH_TOKEN}/${userToken?.id}`,
          userToken?.token ?? ""
        );
      }
    } catch (error) {
      reportToSentry(error, "Error getting a token");
    }
  };

  /*
    HANDLERS
  */

  const addLeague = (league: League) => {
    user?.leagues?.push(league);
    setUser({ ...(user as User) });
  };

  const logout = () => {
    setUser(null);
    setUserToken(null);
    setAuthState(AuthState.LOGGED_OUT);
    SecureStore.deleteItemAsync(CONSTANT.TOKEN_KEY);
  };

  const removeLeague = (leagueId: string) => {
    if (user?.leagues) {
      const leagueIndex = user.leagues.findIndex(
        (league) => league.id === leagueId
      );
      user.leagues.splice(leagueIndex, 1);
      setUser({ ...user });
    }
  };

  const changeAppearance = (newAppearance: string) => {
    setAppearance(newAppearance);
  };

  /*
    UI
  */

  if (authState === AuthState.LOADING) {
    return (
      <View>
        <ActivityIndicator color={"#fff"} size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        addLeague,
        appearance,
        changeAppearance,
        devicePushToken,
        logout,
        removeLeague,
        setUser,
        setUserToken,
        user,
        userToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const CONSTANT = {
  TOKEN_KEY: "AUTHTOKEN",
};
