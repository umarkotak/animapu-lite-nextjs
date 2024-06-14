import { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import { useRouter } from "next/router"
import Link from 'next/link'
import { useAlert } from 'react-alert'

import BottomMenuBar from "../../components/BottomMenuBar"
import animapuApi from "../../apis/AnimapuApi"

var onApiCall = false
var activeSourceIdxDirect = 0
export default function Anime() {
  const alert = useAlert()
  let router = useRouter()

  const [sources, setSources] = useState([])
  const [activeSource, setActiveSource] = useState("")
  const [activeSourceIdx, setActiveSourceIdx] = useState(activeSourceIdxDirect)
  const [formattedSources, setFormattedSources] = useState([{value: "mangabat", label: "select source"}])
  const [panelbearDisable, setPanelbearDisable] = useState('false')

  return (
    // <div className="min-h-screen pb-60 bg-[#d6e0ef]">
    //   <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
    //     <div className="container mx-auto max-w-[768px] pt-2">
    //       <span className="px-4 mb-4 text-white text-xl">Discovery</span>
    //     </div>
    //   </div>

    //   <div className="pt-4 mx-2">
    //   </div>

    //   <BottomMenuBar />
    // </div>
    <div className="bg-[#d6e0ef]">
    <div className="h-screen">
      <iframe
        className="h-screen pb-16"
        title={"https://anichart.net"}
        src={"https://anichart.net"}
        sandbox={"allow-top-navigation allow-same-origin allow-forms allow-scripts"}
        allow="fullscreen"
        style={{
          "display": "block",
          "border": "none",
          "overflow": "hidden",
          "width": "100%"
        }}
        width="100%"
        frameBorder="0"
      />
    </div>
    {/* <div className="mb-4"></div> */}

    <BottomMenuBar no_need_screen={true} />
  </div>
  )
}
