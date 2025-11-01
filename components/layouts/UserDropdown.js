import { Download, LogIn, LogInIcon, LogOut, UserIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

var defaultUser = {
  avatar: "/images/usertemp.png",
}

const ADM_EMS = [
  "umarkotak@gmail.com"
]

export default function UserDropdown() {
  const router = useRouter()
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const pathName = usePathname()

  const [user, setUser] = useState(defaultUser)

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
        // console.log('User accepted the A2HS prompt');
      } else {
        // console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    });
  };

  function Logout() {
    localStorage.removeItem("ANIMAPU_LITE:USER:LOGGED_IN")
    localStorage.removeItem("ANIMAPU_LITE:USER:UNIQUE_SHA")
    localStorage.removeItem("ANIMAPU_LITE:USER:EMAIL")
    toast.info("Logout sukses!")
    setUser(defaultUser)
    window.location.reload()
  }

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
    if (pathName && pathName.startsWith("/admin")) {
      if (!ADM_EMS.includes(localStorage.getItem("ANIMAPU_LITE:USER:EMAIL"))) {
        router.push("/")
      }
    }
  }, [pathName])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-full">
          <Avatar className="h-7 w-7">
            {user.email && user.email !== "" && <AvatarImage src={user.avatar} alt={user.email} />}
            <AvatarFallback className=""><LogInIcon size={18} /></AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        {user.email && user.email !== "" &&
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.email} />
                <AvatarFallback className="rounded-lg"><UserIcon size={20} /></AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.email}</span>
                <span className="truncate text-xs">{"basic"}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        }
        <DropdownMenuSeparator />
        {deferredPrompt &&
          <DropdownMenuItem onClick={()=>handleInstall()}>
            <Download />
            <span>Install App</span>
          </DropdownMenuItem>
        }
        <DropdownMenuSeparator />
        {user.email && user.email !== "" ?
          <DropdownMenuItem onClick={()=>Logout()}><LogOut />Log out</DropdownMenuItem>
        :
          <DropdownMenuItem onClick={()=>router.push("/login")}><LogIn />Log In</DropdownMenuItem>
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
