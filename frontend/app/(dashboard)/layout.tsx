import { BottomNav } from "@/components/bottom-nav/bottom-nav";
import { Fab } from "@/components/fab";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileTopbar } from "@/components/topbar/mobile-topbar";
import { Topbar } from "@/components/topbar/topbar";

export default function DashboardLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <>
         <div
            data-print-layout
            className="flex h-dvh gap-3 overflow-hidden bg-[#cecece]/50 p-3 lg:bg-linear-to-b lg:from-[#EEEEEE] lg:to-[#DADADA] lg:pb-0"
         >
            {/* Desktop Sidebar */}
            <div data-print-hide className="hidden lg:flex">
               <Sidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
               {/* Mobile Topbar */}
               <div data-print-hide className="lg:hidden">
                  <MobileTopbar />
               </div>

               {/* Desktop Topbar */}
               <div data-print-hide className="hidden lg:block">
                  <Topbar />
               </div>

               <main className="flex flex-1 flex-col overflow-y-auto scrollbar-hide">
                  {children}
               </main>

               {/* Mobile Bottom Nav */}
               <div data-print-hide className="lg:hidden">
                  <BottomNav />
               </div>
            </div>
         </div>

         {/* Mobile FAB */}
         <Fab />
      </>
   );
}
