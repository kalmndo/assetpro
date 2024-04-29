import AppShell from "@/components/app-shell";
import React, { type ReactNode } from "react";

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <AppShell>
      anjing
    </AppShell>
  )
}
