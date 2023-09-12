import { useState, useEffect, Fragment } from 'react'
import { useRouter } from "next/router"
import { useAlert } from 'react-alert'
import Link from 'next/link'

import BottomMenuBar from "../components/BottomMenuBar"
import ChangeSourceModal from "../components/ChangeSourceModal"

export default function TestScrap() {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  // eslint-disable-next-line
  }, [])

  return (
    <Fragment>
      <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
        <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
          <div className="container mx-auto max-w-[1040px] pt-2">
            <div className="flex justify-between">
              <span className="px-4 mb-4 text-white">
              </span>
              <span className="px-4 mb-4 text-white">
                <Link href="/home"><a className="mx-2 text-[#3db3f2]"><i className="fa fa-home"></i> Home</a></Link>
                <Link href="/popular"><a className="mx-2 hover:text-[#3db3f2]"><i className="fa fa-star"></i> Popular</a></Link>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="container mx-auto max-w-[1040px]">
            <div className="grid grid-rows-1 grid-flow-col">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                <div className={`flex justify-center px-1 mb-4`}>
                  <div className="w-[175px] h-[265px]">
                    <div className="flex flex-col relative shadow-xl rounded-lg">
                      <div onClick={()=>{}}>
                        <Link href={"#"}>
                          <a className="bg-gray-600 rounded-lg">
                            <img
                              className={`w-full h-[265px] rounded-lg`}
                              src={"http://localhost:6001/mangas/komikindo/image_proxy/https://5ln1h5525y2q.kentut.xyz/data/95954682/76/3d9483735364c353b013f42899db89bf/BxLfQ7a0WHOjSlaSRIgp7fpCKr8bTielScdsbJgP.jpg"}
                              alt="thumb"
                            />
                          </a>
                        </Link>
                      </div>

                      <div onClick={()=>{}}>
                        <Link href={"#"}>
                          <a className="absolute bottom-0 p-2 text-white z-3 rounded-b-lg w-full bg-black bg-opacity-75">
                            <p className="rounded-lg text-sm leading-5 font-sans pb-1 overflow-hidden">
                              test
                            </p>
                            <div className={`flex flex-col text-sm text-[#75b5f0]`}>
                              sub test
                            </div>
                          </a>
                        </Link>
                      </div>
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
