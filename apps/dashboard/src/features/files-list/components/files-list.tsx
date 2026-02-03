import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { TriangleAlert } from "lucide-react";

import { FallBackRender } from "@/components/errors/error-boundary";
import { SuspenseBoundary } from "@/components/errors/suspense-boundary";
import { useDebounce } from "@/hooks/use-debounce";

import { Entry } from "../types-schemas";
import { Files } from "./files";
import { FilesSkeleton } from "./files-skeleton";
import { FiltersSection } from "./filters-section";
import { LanguagesDropDown } from "./languages-dropdown";

export const FilesList = () => {
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const languagesToFetch =
    selectedEntries.length !== 0
      ? selectedEntries.map((entry) => entry.languageSlug)
      : undefined;
  const handleCheckEntry = (entry: Entry) =>
    setSelectedEntries((prev) => {
      const isEntryExisting = prev.some(
        (elt) => elt.languageSlug === entry.languageSlug,
      );

      return isEntryExisting
        ? prev.filter((elt) => elt.languageSlug !== entry.languageSlug)
        : [...prev, entry];
    });

  const [isGrouped, setIsGrouped] = useState(false);
  const handleCheckChange = () => setIsGrouped((prev) => !prev);

  const [isSortedDesc, setIsSortedDesc] = useState(true);
  const handleSortButtonClick = () => setIsSortedDesc((prev) => !prev);

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  return (
    <div className="flex min-h-96 w-full flex-col gap-y-6 self-center rounded-md border p-3 text-2xl">
      <h2 className="text-center text-2xl font-bold">Files List</h2>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-5 rounded-md border p-2">
        <ErrorBoundary
          FallbackComponent={({ error, resetErrorBoundary }) => (
            <FallBackRender
              error={error}
              resetErrorBoundary={resetErrorBoundary}
              hasCustomChildren={true}
              customChildren={
                <h3 className="text-destructive flex h-9 items-center justify-center gap-2 p-1">
                  <TriangleAlert className="size-8 shrink-0 max-xl:size-6" />
                  <span>Error</span>
                </h3>
              }
            />
          )}
        >
          <SuspenseBoundary hasCustomSkeleton={false} className="h-9 w-44">
            <LanguagesDropDown
              selectedEntries={selectedEntries}
              handleCheckEntry={handleCheckEntry}
            />
          </SuspenseBoundary>
        </ErrorBoundary>

        <FiltersSection
          isGrouped={isGrouped}
          searchTerm={searchTerm}
          handleCheckChange={handleCheckChange}
          handleSortButtonClick={handleSortButtonClick}
          handleSearchInputChange={handleSearchInputChange}
        />
      </div>

      <div className="flex w-full flex-1 flex-col gap-4 text-xl max-[42rem]:gap-8">
        <ErrorBoundary
          FallbackComponent={({ error, resetErrorBoundary }) => (
            <FallBackRender
              error={error}
              resetErrorBoundary={resetErrorBoundary}
              hasCustomChildren={false}
              className="text-destructive max-chart:w-full relative z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
            />
          )}
        >
          <SuspenseBoundary
            hasCustomSkeleton={true}
            skeleton={<FilesSkeleton />}
          >
            <Files
              languagesToFetch={languagesToFetch}
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
