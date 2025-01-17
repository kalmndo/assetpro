'use client'
import { signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function LogOut() {
  useEffect(() => {
    signOut({redirect:false}).finally(() => {
      window.location.replace("/");

    })
  }, [])

  return (
    <div>wait</div>
  )

}