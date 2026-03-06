import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t p-4">
      <p className="text-center font-light">
        @{currentYear} MoonCode. Built by{" "}
        <Link
          href="https://github.com/Friedrich482"
          target="_blank"
          className="underline"
        >
          Friedrich482
        </Link>
        . The source code is available on{" "}
        <Link
          href="https://github.com/Friedrich482/mooncode"
          target="_blank"
          className="underline"
        >
          Github
        </Link>
      </p>
    </footer>
  );
};
