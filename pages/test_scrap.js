import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'

import BottomMenuBar from "../components/BottomMenuBar"

export default function TestScrap() {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  return (
    <Fragment>
      <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
        <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
          <div className="container mx-auto max-w-[768px] pt-2">
            <div className="flex justify-between">
              <span className="px-4 mb-4 text-white">
              </span>
              <span className="px-4 mb-4 text-white">
                <Link href="/home" className="mx-2 text-[#3db3f2]"><i className="fa fa-home"></i> Home</Link>
                <Link href="/popular" className="mx-2 hover:text-[#3db3f2]"><i className="fa fa-star"></i> Popular</Link>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="container mx-auto max-w-[768px]">
            <div className="grid grid-rows-1 grid-flow-col">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                <div className="w-[175px] h-[265px]">
                  <div className="flex flex-col relative shadow-xl rounded-lg">
                    <div onClick={()=>{}}>
                      <Link href={"#"} className="bg-gray-600 rounded-lg">
                        <img
                          className={`w-full h-[265px] rounded-lg`}
                          src={"https://komikcast.bz/wp-content/uploads/2019/12/i301dasd23da289.jpg"}
                          alt="thumb"
                        />
                      </Link>
                    </div>

                    <div onClick={()=>{}}>
                      <Link href={"#"} className="absolute bottom-0 p-2 text-white z-3 rounded-b-lg w-full bg-black bg-opacity-75">
                        <p className="rounded-lg text-sm leading-5 font-sans pb-1 overflow-hidden">
                          thumbnail test
                        </p>
                        <div className={`flex flex-col text-sm text-[#75b5f0]`}>
                          thumbnail test
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="w-[175px] h-[265px]">
                  <div className="flex flex-col relative shadow-xl rounded-lg">
                    <div onClick={()=>{}}>
                      <Link href={"#"} className="bg-gray-600 rounded-lg">
                        <img
                          className={`w-full h-[265px] rounded-lg`}
                          src={"https://sv1.imgkc1.my.id/wp-content/img/B/Bloody_Monday/078/001.jpg"}
                          alt="thumb"
                        />
                      </Link>
                    </div>

                    <div onClick={()=>{}}>
                      <Link href={"#"} className="absolute bottom-0 p-2 text-white z-3 rounded-b-lg w-full bg-black bg-opacity-75">
                        <p className="rounded-lg text-sm leading-5 font-sans pb-1 overflow-hidden">
                          page test
                        </p>
                        <div className={`flex flex-col text-sm text-[#75b5f0]`}>
                          page test
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BottomMenuBar />
      </div>
    </Fragment>
  )
}
