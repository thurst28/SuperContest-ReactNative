/*
  BASICS
*/

import { Theme } from "@react-navigation/native";

export type CustomTheme = {
  custom: {
    colors: SuperContestThemeColors;
  };
} & Theme;

export type Contest = {
  id: string;
  name: string;
  picksPerRound: number;
  round: number;
  maxRounds: number;
  helpMessage: string;
};

export type Game = {
  id: string;
  lockTime: number;
  spread: number;
  time: number;
  round: number;
  away: Team;
  home: Team;
  result: string;
  status: ResultStatus;
  timeIso?: string;
  lockTimeIso?: string;
};

export type GameSection = {
  title: string;
  data: [Game];
};

export type GameSet = {
  [key: string]: {
    games: [Game];
    displayDate: string;
    lockTime: number;
  };
};

export type League = {
  admin: string;
  code: string;
  contest: string;
  id: string;
  name: string;
};

export enum ResultStatus {
  "PREGAME" = "PREGAME",
  "RESULT" = "RESULT",
  "COMPLETE" = "COMPLETE",
}

export type PickData = {
  id: string;
  awayTeam: string;
  homeTeam: string;
  isAway: boolean;
  isHome: boolean;
  name: string;
  result: string;
  round: number;
  spread: number;
};

export type Record = {
  win: number;
  loss: number;
  push: number;
};

export type UserPicks = {
  picksByRound: PickData[][];
  homeAwayRecord: { home: Record; away: Record };
  favoriteUnderdogRecord: { favorite: Record; dog: Record };
  record: Record;
};

export type UserPickSection = {
  id: number;
  data: PickData[];
  recordTitle: string;
  title: string;
};

export type Round = {
  id: string;
  title: string;
  data: number;
};

export type Team = {
  id: string;
  name: string;
  users: Array<User>;
  picked?: boolean;
};

/*
  NETWORK
*/

export enum HTTPAction {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum Route {
  ADD_PICK = "games/append",
  ALL_CONTESTS = "contest/all",
  CONTEST = "contest",
  CREATE_CONTEST = "contest/create",
  CREATE_LEAGUE = "league/create",
  DELETE_LEAGUE = "league/delete",
  GAMES = "games",
  LEAGUE_USERS = "league/users",
  LEAVE_LEAGUE = "league/leave",
  LOGIN = "auth/login",
  LOGOUT = "auth/logout",
  MANAGE_GAME = "admin/game",
  JOIN_LEAGUE = "league/join",
  OHFER_WEEKS = "league/getOhferWeeks",
  PUSH_TOKEN = "users/pushToken",
  REGISTER = "auth/register",
  REMOVE_PICK = "games/remove",
  RESET_PASSWORD = "auth/reset-password",
  RESET_REQUEST = "auth/forgot-password",
  STANDINGS = "league/standings",
  UPDATE_USER = "users/manageUsers",
  USER = "users",
  USER_PICKS = "users/picks",
  USER_DETAILS = "users/details",
}

export enum RequestState {
  IDLE,
  LOADING,
  ERROR,
}

/*
  USER
*/

export type User = {
  access: { token: string; expires: string };
  email: string;
  icon: string;
  id: string;
  leagues: Array<League>;
  loss: {
    [key: string]: number;
  };
  money: {
    [key: string]: number;
  };
  name: string;
  refresh: { token: string; expires: string };
  role: string;
  win: {
    [key: string]: number;
  };
  venmo?: string;
  notifications?: boolean;
  pushTokens: [string];
  disabledPushTokens: string[];
};

/*
  UTILITY
*/

export interface SuperContestThemeColors {
  activeGreen: string;
  black: string;
  container: string;
  disabledColor: string;
  disabledText: string;
  gold: string;
  light: string;
  lightBlue: string;
  background: string;
  primary: string;
  negative: string;
  textColor: string;
}

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Auth: undefined;
  Book: undefined;
  CreateLeague: undefined;
  JoinLeague: undefined;
  Modal: undefined;
  NotFound: undefined;
  Ohfers: { initialLeagueId: string };
  PicksByRound: { picksByRound: PickData[][] };
  Standings: undefined;
  User: undefined;
  UserPicks: { userId: string };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  Book: undefined;
  Leagues: undefined;
  Settings: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;
