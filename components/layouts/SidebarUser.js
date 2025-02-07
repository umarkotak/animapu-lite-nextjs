"use client"

import {
  AppWindowMacIcon,
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
import { usePathname } from "next/navigation"

var defaultUser = {
  avatar: "/images/usertemp.png",
}

const ADM_EMS = [
  "umarkotak@gmail.com"
]

export function SidebarUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const pathName = usePathname()

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

  useEffect(() => {
    if (pathName.startsWith("/admin")) {
      if (!ADM_EMS.includes(localStorage.getItem("ANIMAPU_LITE:USER:EMAIL"))) {
        router.push("/")
      }
    }
  }, [pathName])

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
      {deferredPrompt &&
        <SidebarMenuItem>
          <SidebarMenuButton onClick={()=>handleInstall()}>
            <Download />
            <span>Install App</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      }
      <Link href="/setting">
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Settings />
            <span>Setting</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </Link>
      <SidebarMenuItem>
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
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {ADM_EMS.includes(user.email) && <a href="/admin">
                  <DropdownMenuItem>
                    <AppWindowMacIcon />
                    Admin
                  </DropdownMenuItem>
                </a>}
              </DropdownMenuGroup>
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
