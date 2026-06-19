// import { notFound } from "next/navigation";

// import { AppSidebar } from "@/components/layout/app-sidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

// export default function DashboardLayout({
//   admin,
//   provider,
//   customer,
// }: {
//   admin: React.ReactNode;
//   provider: React.ReactNode;
//   customer: React.ReactNode;
// }) {
//   // ⚠️ normally this should come from auth/session
//   const userInfo = {
//     role: "ADMIN", // change dynamically later
//   };

//   // block customer from dashboard
//   if (userInfo.role === "customer") {
//     notFound();
//   }

//   return (
//     <SidebarProvider>
//       <AppSidebar user={userInfo} />

//       <SidebarInset>
//         {/* HEADER */}
//         <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
//           <SidebarTrigger className="-ml-1" />
//           <Separator orientation="vertical" className="mr-2 h-4" />

//           <Breadcrumb>
//             <BreadcrumbList>
//               <BreadcrumbItem className="hidden md:block">
//                 <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
//               </BreadcrumbItem>

//               <BreadcrumbSeparator className="hidden md:block" />

//               <BreadcrumbItem>
//                 <BreadcrumbPage>Overview</BreadcrumbPage>
//               </BreadcrumbItem>
//             </BreadcrumbList>
//           </Breadcrumb>
//         </header>

//         {/* CONTENT */}
//         <div className="flex flex-1 flex-col gap-4 p-4">
//           {userInfo.role === "admin" && admin}
//           {userInfo.role === "provider" && provider}
//           {userInfo.role === "customer" && customer}
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export default async function DashboardLayout({
  admim,
  provider,
  customer,
}: {
  admim: React.ReactNode;
  provider: React.ReactNode;
  customer: React.ReactNode;
}) {
  const { data, error } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data || error) {
    redirect("/login");
  }

  const userRole = data.user.role ?? "CUSTOMER";

  //  block customer
  if (userRole === "CUSTOMER") {
    notFound();
  }

  const userInfo = {
    role: userRole,
    name: data.user.name,
    email: data.user.email,
    image: data.user.image,
  };

  // console.log(userInfo);

  return (
    <SidebarProvider>
      <AppSidebar user={userInfo} />

      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {userRole === "ADMIM" && admim}
          {userRole === "PROVIDER" && provider}
          {userRole === "CUSTOMER" && customer}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
