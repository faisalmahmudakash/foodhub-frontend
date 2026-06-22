// import * as React from "react";
// import { ChevronRight } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import { SearchForm } from "./search-form";
// import { VersionSwitcher } from "./version-switcher";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "../ui/collapsible";
// import { adminRoutes } from "@/routes/adminRoutes";
// import { customerRoutes } from "@/routes/customerRoutes";
// import { providerRoutes } from "@/routes/providerRoutes";
// import { Route } from "@/types";

// export function AppSidebar({
//   user,
//   ...props
// }: { user: { role: string } } & React.ComponentProps<typeof Sidebar>) {
//   let routes: Route[] = [];

//   switch (user.role) {
//     case "ADMIM":
//       routes = adminRoutes;
//       break;

//     case "CUSTOMER":
//       routes = customerRoutes;
//       break;

//     case "PROVIDER":
//       routes = providerRoutes;
//       break;

//     default:
//       routes = [];
//       break;
//   }

//   return (
//     <Sidebar {...props}>
//       <SidebarContent className="gap-0">
//         {/* We create a collapsible SidebarGroup for each parent. */}
//         {routes.map((item) => (
//           <Collapsible
//             key={item.title}
//             title={item.title}
//             defaultOpen
//             className="group/collapsible"
//           >
//             <SidebarGroup>
//               <SidebarGroupLabel
//                 asChild
//                 className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//               >
//                 <CollapsibleTrigger>
//                   {item.title}{" "}
//                   <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
//                 </CollapsibleTrigger>
//               </SidebarGroupLabel>

//               <CollapsibleContent>
//                 <SidebarGroupContent>
//                   <SidebarMenu>
//                     {item.items.map((subItem) => (
//                       <SidebarMenuItem key={subItem.title}>
//                         <SidebarMenuButton asChild>
//                           <a href={subItem.url}>{subItem.title}</a>
//                         </SidebarMenuButton>
//                       </SidebarMenuItem>
//                     ))}
//                   </SidebarMenu>
//                 </SidebarGroupContent>
//               </CollapsibleContent>
//             </SidebarGroup>
//           </Collapsible>
//         ))}
//       </SidebarContent>
//       <SidebarRail />
//     </Sidebar>
//   );
// }

import Image from "next/image";
import * as React from "react";
import { ChevronRight } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

import { adminRoutes } from "@/routes/adminRoutes";
import { customerRoutes } from "@/routes/customerRoutes";
import { providerRoutes } from "@/routes/providerRoutes";
import { Route } from "@/types";

export function AppSidebar({
  user,
  ...props
}: { user: { role: string } } & React.ComponentProps<typeof Sidebar>) {
  let routes: Route[] = [];

  switch (user.role) {
    case "ADMIM":
      routes = adminRoutes;
      break;

    case "CUSTOMER":
      routes = customerRoutes;
      break;

    case "PROVIDER":
      routes = providerRoutes;
      break;

    default:
      routes = [];
      break;
  }

  return (
    <Sidebar {...props}>
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b px-4 py-5">
        <Image
          src="/logo.png" // put your logo in public/logo.png
          alt="FoodHub Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />

        <div>
          <h2 className="text-lg font-bold text-[#0B1E3A]">FoodHub</h2>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
      </div>

      <SidebarContent className="gap-0">
        {routes.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {item.title}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
