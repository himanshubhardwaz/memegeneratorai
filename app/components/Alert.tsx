import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { AlertIntent, Alerts } from "~/contants/alerts";

export default function Alert({
  successAlert,
  errorAlert,
  infoAlert,
}: {
  successAlert: string;
  errorAlert: string;
  infoAlert: string;
}) {
  const fetcher = useFetcher();

  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";

  let closeAlertIntent = "";

  if (successAlert) closeAlertIntent = AlertIntent.CLOSE_SUCCESS_ALERT;
  else if (errorAlert) closeAlertIntent = AlertIntent.CLOSE_ERROR_ALERT;
  else if (infoAlert) closeAlertIntent = AlertIntent.CLOSE_INFO_ALERT;

  const isAlertActive = successAlert || errorAlert || infoAlert;

  useEffect(() => {
    if (isAlertActive) {
      const timeout = setTimeout(() => {
        fetcher.submit(
          { intent: closeAlertIntent },
          { method: "POST", action: "/" }
        );
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [closeAlertIntent, fetcher, isAlertActive]);

  // optimistically closing alert when loading
  if (isLoading) return null;

  if (successAlert) {
    return (
      <div className="toast toast-top">
        <div className="alert alert-success">
          <div>
            <span>{successAlert}</span>
            <fetcher.Form method="post" action="/">
              <button
                className="mt-1"
                name="intent"
                value="close-success-alert"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>
    );
  }

  if (errorAlert) {
    return (
      <div className="toast toast-top ">
        <div className="alert alert-error">
          <div>
            <span>{errorAlert}</span>
            <fetcher.Form method="post">
              <button className="mt-1" name="intent" value="close-error-alert">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>
    );
  }

  if (infoAlert) {
    return (
      <div className="toast toast-top">
        <div className="alert alert-info">
          <div>
            <span>{errorAlert}</span>
            <fetcher.Form method="post">
              <button className="mt-1" name="intent" value="close-info-alert">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
