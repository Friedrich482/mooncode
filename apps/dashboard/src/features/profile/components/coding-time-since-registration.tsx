import { useMemo } from "react";
import { Check } from "lucide-react";

import { useTRPC } from "@/utils/trpc";
import { formatDuration } from "@repo/common/format-duration";
import { getLocaleDate } from "@repo/common/get-locale-date";
import { useSuspenseQuery } from "@tanstack/react-query";

export const CodingTimeSinceRegistration = () => {
  const trpc = useTRPC();
  const { data: user } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  const { data } = useSuspenseQuery(
    trpc.analytics.general.getDaysOfPeriodStats.queryOptions({
      start: getLocaleDate(user.registrationDate),
      end: getLocaleDate(new Date()),
    }),
  );
  const codingTimeSinceRegistration = useMemo(
    () =>
      data
        .map((entry) => entry.timeSpentLine)
        .reduce((acc, curr) => acc + curr, 0),
    [data],
  );

  return (
    <div className="flex w-[98%] gap-4 place-self-center rounded-md border p-4 text-xl">
      <Check className="text-secondary-foreground/80 shrink-0" />
      <p>
        Coding time since the{" "}
        <span className="text-primary font-bold">
          {user.registrationDate.toDateString()}
        </span>{" "}
        (your registration date):{" "}
        <span className="text-primary">
          {formatDuration(codingTimeSinceRegistration)}
        </span>
      </p>
    </div>
  );
};
