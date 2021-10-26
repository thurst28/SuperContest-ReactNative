import * as Sentry from "@sentry/react-native";
import { ENV } from "../components/NetworkComposition";

const reportToSentry = (
  error: Error | unknown,
  message: string = "Somthing went Wrong"
) => {
  if (ENV === "PROD") {
    Sentry.captureMessage(message);
    Sentry.captureException(error);
  } else {
    console.log(message, error);
  }
};

export { reportToSentry };
