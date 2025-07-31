import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import Icon from "@repo/ui/components/ui/Icon";
import { THEME_DROPDOWN_ITEMS } from "@/constants";
import { cn } from "@repo/ui/lib/utils";
import { useTheme } from "@/components/themeProvider";

const ToggleThemeDropDown = () => {
  const { theme: providedTheme, setTheme, resolvedTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Icon Icon={resolvedTheme === "dark" ? Moon : Sun} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-32 flex-col gap-1 p-2" align="end">
        {THEME_DROPDOWN_ITEMS.map(({ Icon, text, theme }) => (
          <DropdownMenuItem
            className={cn(
              "cursor-pointer rounded-md py-1 text-base",
              theme === providedTheme && "border-[1px] border-primary/60",
            )}
            key={text}
            onClick={() => setTheme(theme)}
          >
            <Icon className="size-5" />
            {text}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ToggleThemeDropDown;
