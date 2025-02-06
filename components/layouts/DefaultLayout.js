import * as React from "react"
import { Book, BookMarked, Bot, Calendar, Coffee, GraduationCap, History, Home, HomeIcon, Inbox, Joystick, Pencil, Play, Search, Settings, Slack, SlackIcon, UserCheck } from "lucide-react"
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SIDEBAR_WIDTH,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarUser } from "./SidebarUser"
import { ChangeThemeButton } from "../utils/ChangeThemeButton"
import { usePathname } from "next/navigation"
import { Button } from "../ui/button"
import Link from "next/link"
import { Separator } from "@radix-ui/react-separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "../ui/breadcrumb"
import { useSwipeable } from 'react-swipeable'

const menuItems = [
  { title: "Home", url: "/home", icon: Home },
]

const mangaItems = [
  { title: "Latest", url: "/latest", icon: Book },
  { title: "Search", url: "/search", icon: Search },
  { title: "Library", url: "/library", icon: BookMarked },
  { title: "History", url: "/history", icon: History },
]

const animeItems = [
  // { title: "Latest", url: "/anime/latest", icon: Play },
  // { title: "Search", url: "/anime/search", icon: Search },
  // { title: "Library", url: "/anime/library", icon: BookMarked },
  // { title: "History", url: "/anime/history", icon: History },
]

export function DefaultLayout({ children }) {
  const pathname = usePathname()

  return (
    <>
      <SidebarProvider>
        <Sidebar
          collapsible="icon"
          variant="sidebar"
        >
          <SidebarHeader>
            <SidebarMenu>
              <a href="/">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                      <img src="/images/cover192.png" className="rounded-lg" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        Animapu
                      </span>
                      <span className="truncate text-xs">from weebs to weebs</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </a>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.url == pathname}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Manga</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mangaItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.url == pathname}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Anime</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="https://animehub-lite.vercel.app">
                        <Play />
                        <span>Watch Anime</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {animeItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.url == pathname}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarUser />
          </SidebarFooter>
        </Sidebar>

        <SidebarMain children={children} />
      </SidebarProvider>
    </>
  )
}

function SidebarMain({ children }) {
  const pathName = usePathname()
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()
  const [breadcrumb, setBreadcrumb] = React.useState("")

  React.useEffect(() => {
    var tempBreadcrumb = pathName
    setBreadcrumb(tempBreadcrumb.split("/")[1])

    if (pathName.startsWith("/watch")) {
      setOpen(false)
      return
    }

    setOpen(true)
  }, [pathName])

  var swipeConfig = {}
  const handlers = useSwipeable({
    // onSwiped: (eventData) => console.log("User Swiped!", eventData),
    onSwipedRight: () => {
      setOpen(true)
      setOpenMobile(true)
    },
    ...swipeConfig,
  });

  return(
    <div className={`${!isMobile ? open ? "w-[calc(100%-13rem)]": "w-[calc(100%-3rem)]" : "w-full"}`}>
      <header className="sticky top-0 flex justify-between h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 z-40 bg-background border-b border-primary">
      {/* <header className="flex justify-between h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 backdrop-blur-md z-50 bg-inherit"> */}
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList><BreadcrumbItem>
              <BreadcrumbLink href="#">{breadcrumb}</BreadcrumbLink>
            </BreadcrumbItem></BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex justify-end items-center gap-2 px-4">
          <a href="https://trakteer.id/marumaru">
            <Button variant="outline" size="sm">
              <Coffee size="14" />
              Bantu Animapu
            </Button>
          </a>
          <ChangeThemeButton />
        </div>
      </header>

      <div
        className="p-2 w-full"
        {...handlers}
      >
        <div className="mx-auto w-full max-w-[768px]">
          {children}
        </div>
      </div>
    </div>
  )
}
