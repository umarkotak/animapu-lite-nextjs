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
      if (response.status == 200) {
        setLogs(body.data.reverse())
      }

    } catch (e) {
      console.error(e)
    }

    onApiCall = false
  }

  useEffect(() => {
    GetLogs()
  }, [])

  return (
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[768px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Error Logs</span>
        </div>
      </div>

      <div className="pt-4 mx-2">
        <div className="container mx-auto max-w-[768px]">
              {logs.map((log, idx) => (
                <div className='bg-white rounded-md mb-2 p-1 text-xs' key={`${idx}-${log.request_id}`}>
                  <div >
                    {log.formatted_time} - {log.layer}
                  </div>
                  <div>
                    <p className='break-all text-xs'>{log.error_message}</p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <BottomMenuBar />
    </div>
  )
}
