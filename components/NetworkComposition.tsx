import React, { createContext, ReactNode, useContext } from "react";

import { AuthContext } from "./AuthComposition";
import { HTTPAction, RequestState } from "../types/types";

type Body = {
  [key: string]: any;
};

type Parameters = {
  [key: string]: string;
};

type RequestOptions = {
  method: HTTPAction;
  headers: {
    Authorization: string;
    "Content-Type": string;
  };
  body?: string;
};

type NetworkResponse =
  | { status: RequestState.ERROR; message: string }
  | { status: RequestState.IDLE; [key: string]: any };

export const ENV = "PROD";
const api =
  ENV === "DEV"
    ? "http://localhost:3000/v1/"
    : "https://supercontest-api.yamyum.dev/v1/";

type NetworkContextType = {
  sendNetworkRequest:
    | ((
        action: HTTPAction,
        body: Body | null,
        parameters: Parameters | null,
        route: string,
        token: string | null
      ) => Promise<NetworkResponse>)
    | null;
};

export const NetworkContext = createContext<NetworkContextType>({
  sendNetworkRequest: null,
});

export const networkRequest = async (
  action: HTTPAction,
  body: Body | null,
  parameters: Parameters | null,
  route: string,
  token: string | null
) => {
  const getParameterString = () => {
    let parameterString = "?";
    Object.keys(parameters as Parameters).forEach((key, i) => {
      parameterString += `${key}=${(parameters as Parameters)[key]}`;
      if (i !== Object.keys(parameters as Parameters).length - 1) {
        parameterString += "&";
      }
    });

    return parameterString;
  };

  const options: RequestOptions = {
    method: action,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const rawResponse = await fetch(
    `${api}${route}${parameters ? getParameterString() : ""}`,
    options
  );

  return rawResponse;
};

export default ({ children }: { children: ReactNode }) => {
  const { setUser } = useContext(AuthContext);

  const sendNetworkRequest = async (
    action: HTTPAction,
    body: Body | null,
    parameters: Parameters | null,
    route: string,
    token: string | null
  ) => {
    const rawResponse = await networkRequest(
      action,
      body,
      parameters,
      route,
      token
    );

    const response = await rawResponse.json();

    // ERROR

    if (!rawResponse.ok) {
      if (response.message === "Please authenticate") {
        setUser(null);
      }

      const message = `An error has occured: ${response.message}`;
      return { status: RequestState.ERROR, message };
    }

    return { status: RequestState.IDLE, ...response };
  };

  return (
    <NetworkContext.Provider value={{ sendNetworkRequest }}>
      {children}
    </NetworkContext.Provider>
  );
};
