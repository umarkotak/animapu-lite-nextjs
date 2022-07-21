import { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import { useRouter } from "next/router"
import Link from 'next/link'

import BottomMenuBar from "../components/BottomMenuBar"
import animapuApi from "../apis/AnimapuApi"

var onApiCall = false
export default function Errlogs() {
  const [logs, setLogs] = useState([])

  async function GetLogs() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.GetLogs({})
      const body = await response.json()
      console.log(body)
      if (response.status == 200) {
        setLogs(body.data)
      }

    } catch (e) {
      console.log(e)
    }

    onApiCall = false
  }

  useEffect(() => {
    GetLogs()
  // eslint-disable-next-line
  }, [])

  return (
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Error Logs</span>
        </div>
      </div>

      <div className="pt-4 mx-2">
        <div className="container mx-auto max-w-[1040px]">
          <div className="bg-[#fafafa] rounded p-4 mb-2 shadow-md">
            {logs.map((log, idx) => (
              <div className="mb-2 p-1 border-b" key={`${idx}-${log.request_id}`}>
                <div>{log.request_id}</div>
                <div>{log.error_message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomMenuBar />
    </div>
  )
}
