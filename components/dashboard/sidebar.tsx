"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  LogOut,
  ChefHat,
  ChevronRight,
  LayoutGrid,
  Layers,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────

type NavChild = {
  title: string;
  href: string;
  icon: any;
};

type NavItem = {
  title: string;
  href: string;
  icon: any;
  roles: string[];
  children: NavChild[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

// ─── Nav Config ───────────────────────────────────────

const navSections: NavSection[] = [
  {
    label: "Management",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["OWNER", "MANAGER"],
        children: [],
      },
      {
        title: "Menu",
        href: "/menu",
        icon: UtensilsCrossed,
        roles: ["OWNER", "MANAGER"],
        children: [
          {
            title: "Categories",
            href: "/menu/categories",
            icon: LayoutGrid,
          },
          {
            title: "Items",
            href: "/menu/items",
            icon: UtensilsCrossed,
          },
          {
            title: "Variants & Addons",
            href: "/menu/variants",
            icon: Layers,
          },
        ],
      },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingBag,
        roles: ["OWNER", "MANAGER", "CASHIER"],
        children: [],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["OWNER"],
        children: [],
      },
    ],
  },
];

// ─── Role Badge ───────────────────────────────────────

const roleBadge: Record<string, { label: string; color: string }> = {
  OWNER: {
    label: "Owner",
    color: "bg-[#fff7ed] text-[#f97316] border border-[#fed7aa]",
  },
  MANAGER: {
    label: "Manager",
    color: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]",
  },
  CASHIER: {
    label: "Cashier",
    color: "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]",
  },
};

// ─── Collapsible Nav Item ─────────────────────────────

function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const isMenuOpen = pathname.startsWith(item.href);
  const [open, setOpen] = useState(isMenuOpen);
  const Icon = item.icon;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        {/* Parent row — no navigation, just expands */}
        <div
          className={`flex items-center rounded-lg transition-all duration-150
          ${open || isMenuOpen ? "bg-[#fff7ed]" : "hover:bg-[#f9f9f9]"}
        `}>
          <div
            className={`
            flex items-center gap-3 flex-1 px-3 py-2
            text-sm font-medium select-none cursor-default
            ${open || isMenuOpen ? "text-[#f97316]" : "text-[#6b7280]"}
          `}
          >
            <Icon
              className={`
              w-5 h-5 shrink-0
              ${open || isMenuOpen ? "text-[#f97316]" : "text-[#9ca3af]"}
            `}
            />
            <span>{item.title}</span>
          </div>

          <CollapsibleTrigger asChild>
            <button
              className="p-2 mr-1 rounded-md hover:cursor-pointer transition-colors duration-150"
              aria-label="Toggle submenu"
            >
              <ChevronRight
                className={`
                w-4 h-4 transition-transform duration-200
                ${open ? "rotate-90 text-[#f97316]" : "text-[#9ca3af]"}
              `}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Children */}
        <CollapsibleContent>
          <SidebarMenuSub className="ml-6 mt-0.5 border-l border-[#e5e7eb] pl-3 space-y-0.5">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const childActive =
                pathname === child.href ||
                pathname.startsWith(child.href + "/");

              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton
                    asChild
                    className={`
                      flex items-center gap-2 text-sm px-2 py-1.5 rounded-md
                      transition-all duration-150
                      ${
                        childActive
                          ? "text-[#f97316] font-medium bg-[#fff7ed]"
                          : "text-[#6b7280] hover:text-[#111111] hover:bg-[#f9f9f9]"
                      }
                    `}
                  >
                    <Link href={child.href as any}>
                      <ChildIcon
                        className={`
                        w-4 h-4 shrink-0
                        ${childActive ? "text-[#f97316]" : "text-[#9ca3af]"}
                      `}
                      />
                      <span>{child.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// ─── Main Sidebar Component ───────────────────────────

interface AppSidebarProps {
  role: string;
  name: string;
  email: string;
}

export default function AppSidebar({ role, name, email }: AppSidebarProps) {
  const pathname = usePathname();
  const badge = roleBadge[role] ?? roleBadge.CASHIER;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <Sidebar>
      {/* ── Header ── */}
      <SidebarHeader className="border-b border-[#e5e7eb] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center shadow-sm shrink-0">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#111111] leading-none">
              LocalBite
            </p>
            <p className="text-xs text-[#9ca3af] mt-0.5">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent className="px-2 py-3">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.roles.includes(role),
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-2 mb-1">
                {section.label}
              </SidebarGroupLabel>

              <SidebarMenu>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const hasChildren = item.children.length > 0;

                  if (hasChildren) {
                    return (
                      <CollapsibleNavItem
                        key={item.href}
                        item={item}
                        pathname={pathname}
                      />
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg
                          text-sm transition-all duration-150
                          ${
                            active
                              ? "bg-[#fff7ed] text-[#f97316] font-medium hover:bg-[#fff7ed] hover:text-[#f97316]"
                              : "text-[#6b7280] hover:bg-[#f9f9f9] hover:text-[#111111]"
                          }
                        `}
                      >
                        <Link href={item.href as any}>
                          <Icon
                            className={`
                            w-5 h-5 shrink-0
                            ${active ? "text-[#f97316]" : "text-[#9ca3af]"}
                          `}
                          />
                          <span>{item.title}</span>
                          {active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-[#e5e7eb] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-semibold">
              {name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111111] truncate leading-none mb-0.5">
              {name}
            </p>
            <p className="text-xs text-[#9ca3af] truncate">{email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`
            text-xs font-medium px-2 py-0.5 rounded-full
            ${badge.color}
          `}
          >
            {badge.label}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 bg-transparent text-[#9ca3af] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors duration-150"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
