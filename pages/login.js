import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from "react-toastify"
import { jwtDecode } from "jwt-decode";
var sha512 = require('js-sha512').sha512

const G_CLIENT_ID = "915149914245-vd6k2rs1qgaeqddb1mticba2aumtaq4h.apps.googleusercontent.com"

export default function Login() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <img src="/images/cover192.png" className="h-10 w-10 rounded-lg" />
          Animapu
        </Link>
        <SignInForm />
      </div>
    </div>
  )
}

function SignInForm({className, ...props}) {
  const router = useRouter()

  function GoogleLoginCallback(response) {
    try {
      var googleData = response
      console.log("GOOGLE", googleData)
      const decoded = jwtDecode(googleData.credential)
      console.log("GOOGLED", decoded)

      var initialString = `${decoded.sub}-${decoded.email}`
      localStorage.setItem("ANIMAPU_LITE:USER:LOGGED_IN", "true")
      localStorage.setItem("ANIMAPU_LITE:USER:UNIQUE_SHA", sha512(initialString))
      localStorage.setItem("ANIMAPU_LITE:USER:EMAIL", decoded.email)

      toast.info("Login sukses!")
      // router.push("/home")
      window.location.href = "/home"
    } catch(e) {
      toast.error(`Error: ${e}`)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Hello!</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <GoogleOAuthProvider clientId={G_CLIENT_ID}>
                    <GoogleLogin
                      className="block w-full text-center"
                      clientId={G_CLIENT_ID}
                      buttonText="Continue With Google"
                      onSuccess={GoogleLoginCallback}
                      onFailure={GoogleLoginCallback}
                      cookiePolicy={'single_host_origin'}
                    />
                  </GoogleOAuthProvider>
                </div>
              </div>
              <div className="text-center text-sm">
                once you login, you will be automatically registered
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
