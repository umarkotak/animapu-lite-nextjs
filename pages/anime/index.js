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
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Setting</span>
        </div>
      </div>

      <div className="pt-4 mx-2">
      </div>

      <BottomMenuBar />
    </div>
  )
}
