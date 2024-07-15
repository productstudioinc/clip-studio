"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Package2, Menu, CircleUser, LucideIcon } from "lucide-react";
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

  const getTitle = (route: string): string => {
    switch (route) {
      case "/studio/templates":
        return "Templates";
      case "/studio/transcribe":
        return "Transcribe";
      case "/studio/voiceover":
        return "Voiceover";
      case "/studio/export":
        return "Export";
      default:
        return "Studio";
    }
  };

  const navItems: NavItem[] = [
    { href: "/studio/templates", icon: LayoutTemplateIcon, label: "Templates" },
    { href: "/studio/transcribe", icon: CaptionsIcon, label: "Transcribe" },
    { href: "/studio/voiceover", icon: MicVocalIcon, label: "Voiceover" },
    { href: "/studio/export", icon: FileUpIcon, label: "Export" },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Acme Inc</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
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
      <div className="flex flex-col">
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
                  <Package2 className="h-6 w-6" />
                  <span className="">Acme Inc</span>
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              {getTitle(currentRoute)}
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
