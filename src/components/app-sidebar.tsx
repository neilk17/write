import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <>
      <Sidebar className="border-r-0 mt-[36px]">
        <SidebarContent></SidebarContent>
        <SidebarFooter></SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
