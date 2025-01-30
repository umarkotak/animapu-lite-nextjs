import { useRouter } from "next/router.js"
import Home from "./home.js"
import HomeLegacy from "./home_legacy.js"
import { useEffect } from "react"

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    router.push("/home")
  }, [])
}
