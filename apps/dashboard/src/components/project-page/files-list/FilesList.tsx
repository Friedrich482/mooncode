import { useEffect, useState } from "react";
import { Entry } from "@/types-schemas";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "@/components/suspense/ErrorFallback";
import Files from "./Files";
import FiltersSection from "./FiltersSection";
import LanguagesDropDown from "./LanguagesDropDown";
import SuspenseBoundary from "@/components/suspense/SuspenseBoundary";
import { TriangleAlert } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

const FilesList = () => {
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const languagesToFetch =
    selectedEntries.length !== 0
      ? selectedEntries.map((entry) => entry.languageSlug)
      : undefined;

  const [isGrouped, setIsGrouped] = useState(false);
  const handleCheckChange = () => setIsGrouped((prev) => !prev);

  const [limitInput, setLimitInput] = useState("");
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const handleLimitInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLimitInput(e.target.value);

  const [isSortedDesc, setIsSortedDesc] = useState(true);
  const handleSortButtonClick = () => setIsSortedDesc((prev) => !prev);

  useEffect(() => {
    if (limitInput.length === 0) {
      setLimit(undefined);
    } else {
      const parsedLimit = parseInt(limitInput, 10);

      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        setLimit(parsedLimit);
      } else {
        setLimit(undefined);
      }
    }
  }, [limitInput]);

  return (
    <div className="flex min-h-96 w-full flex-col gap-y-6 self-center rounded-md border p-3 text-2xl">
      <h2 className="text-center text-2xl font-bold">Files List</h2>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-5 rounded-md border p-2">
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

        <FiltersSection
          isGrouped={isGrouped}
          limitInput={limitInput}
          handleCheckChange={handleCheckChange}
          handleLimitInputChange={handleLimitInputChange}
          handleSortButtonClick={handleSortButtonClick}
        />
      </div>

      <div
        className={cn(
          "grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4 text-xl max-[42rem]:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] max-[42rem]:gap-8",
          isGrouped && "pt-10",
        )}
      >
        <ErrorBoundary FallbackComponent={ErrorFallBack}>
          <SuspenseBoundary fallBackClassName="h-[52rem] w-full max-chart:w-full">
            <Files
              languagesToFetch={languagesToFetch}
              isGrouped={isGrouped}
              amount={limit}
              isSortedDesc={isSortedDesc}
            />
          </SuspenseBoundary>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default FilesList;
