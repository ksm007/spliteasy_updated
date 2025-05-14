// "use client"
// import { 
//   Sidebar, 
//   SidebarContent, 
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem
// } from "@/components/ui/sidebar";
// import { 
//   Home, 
//   ReceiptText, 
//   Users, 
//   History,
//   Plus
// } from "lucide-react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// const menuItems = [
//   {
//     title: "Dashboard",
//     icon: Home,
//     path: "/dashboard",
//   },
//   {
//     title: "Upload Receipt",
//     icon: Plus,
//     path: "/upload",
//   },
//   {
//     title: "Transactions",
//     icon: History,
//     path: "/transactions",
//   }
// ];

// const AppSidebar = () => {
//   const pathname = usePathname();
  
//   return (
//     <Sidebar>
//       <SidebarHeader className="flex items-center h-14 px-6 border-b">
//         <Link href="/dashboard" className="flex items-center gap-2">
//           <ReceiptText className="h-6 w-6 text-primary" />
//           <span className="font-semibold text-xl">SplitSmart</span>
//         </Link>
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {menuItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild isActive={pathname === item.path}>
//                     <Link href={item.path}>
//                       <item.icon className="h-4 w-4" />
//                       <span>{item.title}</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
        
//         <SidebarGroup className="mt-6">
//           <SidebarGroupLabel>Friends</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                   <Link href="#">
//                     <Users className="h-4 w-4" />
//                     <span>Manage Friends</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// };

// export default AppSidebar;
