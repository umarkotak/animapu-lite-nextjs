import { useState } from "react"
import { useRouter } from "next/router"

export default function BottomMenuBar(props) {
  let router = useRouter()

  const [isOpen, setIsOpen] = useState(props.isOpen || true)

  return(
    <div className="w-full h-screen">
      <div className="block fixed inset-x-0 bottom-0 z-10">
        <div className="flex justify-end mr-4 mb-2">
          <div className="bg-[#2b2d42] bg-opacity-50 py-1 px-2 rounded">
            <button className="focus:text-teal-500 hover:text-teal-500" onClick={() => {setIsOpen(!isOpen)}}>
              <i className="fi fi-rr-grid text-white" width="25" height="25"></i>
            </button>
          </div>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} flex justify-between bg-[#2b2d42] pb-2`}>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/")}>
            <i className="fi fi-rr-home" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Home</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/search")}>
            <i className="fi fi-rr-search" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Search</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/history")}>
            <i className="fi fi-rr-time-past" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">History</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/setting")}>
            <i className="fi fi-rr-settings" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Setting</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/account")}>
            <i className="fi fi-rr-user" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Account</span>
          </button>
        </div>
      </div>
    </div>
  )
}
