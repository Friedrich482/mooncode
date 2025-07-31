import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Entry } from "@/types-schemas";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "@/components/suspense/ErrorFallback";
import Files from "./Files";
import LanguagesDropDown from "./LanguagesDropDown";
import SuspenseBoundary from "@/components/suspense/SuspenseBoundary";
import { TriangleAlert } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useState } from "react";

const FilesList = () => {
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const [isGrouped, setIsGrouped] = useState(false);
  const handleCheckChange = () => setIsGrouped((prev) => !prev);
  const languagesToFetch =
    selectedEntries.length !== 0
      ? selectedEntries.map((entry) => entry.languageSlug)
      : undefined;

  return (
    <div className="flex min-h-96 w-full flex-col gap-y-6 self-center rounded-md border p-3 text-2xl">
      <h2 className="text-center text-2xl font-bold">Files List</h2>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <ErrorFallBack error={error}>
              <h3 className="flex h-9 items-center justify-center gap-2 p-1 text-destructive">
                <TriangleAlert className="size-8 shrink-0 max-xl:size-6" />
                <span>Error</span>
              </h3>
            </ErrorFallBack>
          )}
        >
          <SuspenseBoundary fallBackClassName="h-9 w-44">
            <LanguagesDropDown
              selectedEntries={selectedEntries}
              setSelectedEntries={setSelectedEntries}
            />
          </SuspenseBoundary>
        </ErrorBoundary>

        <div className="flex gap-4">
          <p>Group</p>
          <Checkbox
            className="size-8"
            checked={isGrouped}
            onCheckedChange={handleCheckChange}
          />
        </div>
      </div>

      <div
        className={cn(
          "grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4 text-xl max-[42rem]:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] max-[42rem]:gap-8",
          isGrouped && "pt-10",
        )}
      >
        <ErrorBoundary FallbackComponent={ErrorFallBack}>
          <SuspenseBoundary fallBackClassName="h-[52rem] w-full max-chart:w-full">
            <Files languagesToFetch={languagesToFetch} isGrouped={isGrouped} />
          </SuspenseBoundary>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default FilesList;
