export const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds} sec${seconds !== 1 ? "s" : ""}`;
  } else {
    const minutes = Math.floor((seconds % 3600) / 60);
    const hours = Math.floor(seconds / 3600);
    const hoursDisplay =
      hours > 0 ? `${hours} hr${hours !== 1 ? "s" : ""} ` : "";
    let minutesDisplay = "";

    if (hours === 0) {
      minutesDisplay =
        minutes > 0 ? `${minutes} min${minutes !== 1 ? "s" : ""}` : "0 mins"; // Handle zero seconds case explicitly
    } else if (minutes > 0) {
      minutesDisplay = `${minutes} min${minutes !== 1 ? "s" : ""}`;
    }

    return `${hoursDisplay}${minutesDisplay}`;
  }
};
