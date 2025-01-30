"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Download,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { toast } from "react-toastify"

var defaultUser = {
  avatar: "/images/usertemp.png",
}

export function SidebarUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()

  const [user, setUser] = useState(defaultUser)

  function LoginCheck() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
        setUser({
          ...user,
          email: localStorage.getItem("ANIMAPU_LITE:USER:EMAIL"),
        })
      }
    }
  }
  useEffect(() => {
    LoginCheck()
  }, [])

  function Logout() {
    localStorage.removeItem("ANIMAPU_LITE:USER:LOGGED_IN")
    localStorage.removeItem("ANIMAPU_LITE:USER:UNIQUE_SHA")
    localStorage.removeItem("ANIMAPU_LITE:USER:EMAIL")
    toast.info("Logout sukses!")
    setUser(defaultUser)
  }

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log("hello")
      event.preventDefault();
      setDeferredPrompt(event);
    });
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {deferredPrompt && <SidebarMenuButton onClick={()=>handleInstall()}>
          <Download />
          <span>Install App</span>
        </SidebarMenuButton>}
        <SidebarMenuButton asChild>
          <Link href="/setting">
            <Settings />
            <span>Setting</span>
          </Link>
        </SidebarMenuButton>
        {user.email ?
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              {/* <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={()=>Logout()}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        :
          <SidebarMenuButton asChild>
            <Link href="/login">
              <LogIn />
              <span>Login</span>
            </Link>
          </SidebarMenuButton>
        }
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
