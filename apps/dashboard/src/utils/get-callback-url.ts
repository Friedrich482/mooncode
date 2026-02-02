export const getCallbackUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const callbackParam = urlParams.get("callback");
  const callbackUrl = callbackParam ? decodeURIComponent(callbackParam) : null;
  return callbackUrl;
};
