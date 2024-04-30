import AppShell from "@/components/app-shell";
import { Layout, LayoutBody, LayoutHeader } from "@/components/custom/layout";
import { Input } from "@/components/ui/input";
import { UserNav } from "@/components/user-nav";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode
}

const Search = () => {
  return (
    <div>
      <Input
        type='search'
        placeholder='Search...'
        className='md:w-[100px] lg:w-[300px]'
      />
    </div>
  )
}

export default function LayoutYa({ children }: Props) {
  return (
    <AppShell>
      <Layout>
        <LayoutHeader>
          <Search />

          <div className='ml-auto flex items-center space-x-4'>
            {/* <ThemeSwitch /> */}
            <UserNav />
          </div>
        </LayoutHeader>
        <LayoutBody className='flex flex-col' fixedHeight>
          {children}
        </LayoutBody>
      </Layout>
    </AppShell>
  )
}
