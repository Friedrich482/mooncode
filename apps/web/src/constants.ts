import { type IconType, SiGithub, SiX } from "@icons-pack/react-simple-icons";

export const NAVBAR_LINKS: { href: string; text: string }[] = [
  {
    href: "features",
    text: "Features",
  },
  { href: "architecture", text: "Architecture" },
  {
    href: "installation",
    text: "Installation",
  },
];

export const HEADER_ADDITIONAL_LINKS: {
  href: string;
  Icon: IconType;
  label: string;
}[] = [
  {
    href: "https://github.com/Friedrich482/mooncode",
    Icon: SiGithub,
    label: "GitHub link",
  },
  {
    href: "https://x.com/FriedrichC109",
    Icon: SiX,
    label: "Twitter Link",
  },
];
