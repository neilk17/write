"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  onItemClick,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
  onItemClick?: (title: string) => void;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild={!onItemClick || item.url !== "#"}
            isActive={item.isActive}
            onClick={() => onItemClick?.(item.title)}
          >
            {!onItemClick || item.url !== "#" ? (
              <a href={item.url}>
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
