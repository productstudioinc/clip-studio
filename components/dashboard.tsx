"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, CircleUser, LucideIcon, CogIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutTemplateIcon,
  CaptionsIcon,
  MicVocalIcon,
  FileUpIcon,
} from "lucide-react";
import { VideoPreview } from "./video-preview";
import { ReactNode } from "react";
import useTemplateConfig from "@/stores/templateConfig";
import { useTemplateStore } from "@/stores/templatestore";
import { ModeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface NavLinkProps extends NavItem {
  currentRoute: string;
}

interface DashboardProps {
  children: ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  icon: Icon,
  label,
  currentRoute,
}) => (
  <Link
    href={href}
    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      currentRoute === href ? "bg-muted text-primary" : "text-muted-foreground"
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </Link>
);

export const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const currentRoute = usePathname();

  const { selectedTemplate } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
  }));

  const getTitle = (route: string): string => {
    switch (route) {
      case "/studio/templates":
        return "Templates";
      case "/studio/configure":
        return "Configure";
      case "/studio/voiceover":
        return selectedTemplate === "SplitScreen" ? "Caption" : "Voiceover";
      case "/studio/caption":
        return selectedTemplate === "SplitScreen" ? "Caption" : "Voiceover";
      case "/studio/export":
        return "Export";
      default:
        return "Studio";
    }
  };

  const navItems: NavItem[] = [
    { href: "/studio/templates", icon: LayoutTemplateIcon, label: "Templates" },
    { href: "/studio/configure", icon: CogIcon, label: "Configure" },
    {
      href:
        selectedTemplate === "SplitScreen"
          ? "/studio/caption"
          : "/studio/voiceover",
      icon: selectedTemplate === "SplitScreen" ? CaptionsIcon : MicVocalIcon,
      label: selectedTemplate === "SplitScreen" ? "Caption" : "Voiceover",
    },
    { href: "/studio/export", icon: FileUpIcon, label: "Export" },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span className="">Clip Studio</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  currentRoute={currentRoute}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Logo />
                  <span className="">Clip Studio</span>
                </Link>
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    currentRoute={currentRoute}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1"></div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-col p-4 lg:p-6 flex-grow overflow-auto">
          <div className="flex items-center mb-4">
            <h1 className="text-lg font-semibold md:text-2xl">
              {getTitle(currentRoute)}
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 min-h-0 flex-grow">
            <div className="w-full lg:w-1/2 overflow-hidden flex flex-col">
              <div className="flex-grow overflow-auto rounded-lg border shadow-sm">
                {children}
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-muted rounded-lg">
              <div className="w-full h-full max-h-[calc(50vw*16/9)] lg:max-h-[calc((100vh-60px-2rem)*0.9)] aspect-[9/16]">
                <VideoPreview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
      />
    </svg>
  );
};
