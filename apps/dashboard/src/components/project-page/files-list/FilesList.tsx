import { useEffect, useState } from "react";
import { Entry } from "@/types-schemas";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "@/components/suspense/ErrorFallback";
import Files from "./Files";
import FiltersSection from "./FiltersSection";
import LanguagesDropDown from "./LanguagesDropDown";
import SuspenseBoundary from "@/components/suspense/SuspenseBoundary";
import { TriangleAlert } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

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
  const debouncedLimit = useDebounce(limit, 500);

  const [isSortedDesc, setIsSortedDesc] = useState(true);
  const handleSortButtonClick = () => setIsSortedDesc((prev) => !prev);

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
          searchTerm={searchTerm}
          handleCheckChange={handleCheckChange}
          handleLimitInputChange={handleLimitInputChange}
          handleSortButtonClick={handleSortButtonClick}
          handleSearchInputChange={handleSearchInputChange}
        />
      </div>

      <div className="flex w-full gap-4 text-xl max-[42rem]:gap-8">
        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <ErrorFallBack
              error={error}
              className="relative z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl text-destructive max-xl:text-xl max-chart:w-full max-[30rem]:text-lg"
            />
          )}
        >
          <SuspenseBoundary fallBackClassName="h-[52rem] w-full max-chart:w-full">
            <Files
              languagesToFetch={languagesToFetch}
              amount={debouncedLimit}
              searchTerm={debouncedSearchTerm}
              isGrouped={isGrouped}
              isSortedDesc={isSortedDesc}
            />
          </SuspenseBoundary>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default FilesList;
