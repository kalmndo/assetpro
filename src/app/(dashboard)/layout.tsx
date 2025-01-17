'use server'
import AppShell from "@/components/app-shell";
import Cart from "@/components/cart";
import { Layout, LayoutBody, LayoutHeader } from "@/components/custom/layout";
import LogOut from "@/components/logout";
import Notification from "@/components/notification";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserNav } from "@/components/user-nav";
import { api } from "@/trpc/server";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const Search = () => {
  return (
    <div>
      <Input
        type="search"
        placeholder="Search..."
        className="md:w-[100px] lg:w-[300px]"
      />
    </div>
  );
};

export default async function LayoutYa({ children }: Props) {
  const result = await api.user.me();

  if (!result.data) {
   return <LogOut /> 
   
  }

  return (
    <AppShell userRoles={result.data.userRoles}>
      <Layout>
        <LayoutHeader>
          <Search />
          <div className="ml-auto flex items-center space-x-4">
            {/* <ThemeSwitch /> */}
            <Notification notifications={result.data.notifications} userId={result.data.id} />
            <Cart />
            <UserNav data={result.data && result.data} />
          </div>
        </LayoutHeader>
        <LayoutBody className="flex flex-col" fixedHeight>
          <TooltipProvider>{children}</TooltipProvider>
        </LayoutBody>
      </Layout>
    </AppShell>
  );
}
