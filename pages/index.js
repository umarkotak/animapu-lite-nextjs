import { useRouter } from "next/router.js"
import { useEffect } from "react"

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    router.push("/home")
  }, [])
}
