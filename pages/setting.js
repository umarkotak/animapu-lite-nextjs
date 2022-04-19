import { useState, useEffect, useRef } from 'react'
import { useRouter } from "next/router"

import BottomMenuBar from "../components/BottomMenuBar"
import animapuApi from "../apis/AnimapuApi"

var onApiCall = false
export default function Home() {
  let router = useRouter()

  const [sources, setSources] = useState([])
  const [activeSource, setActiveSource] = useState("")

  async function GetSourceList() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.GetSourceList({})
      const body = await response.json()
      console.log(body)
      if (response.status == 200) {
        setSources(body.data)
        setActiveSource(animapuApi.GetActiveMangaSource())
      }
      onApiCall = false

    } catch (e) {
      console.log(e)
      onApiCall = false
    }
  }

  useEffect(() => {
    GetSourceList()
  // eslint-disable-next-line
  }, [])

  function changeMangaSource(source) {
    if (typeof window !== "undefined") {
      localStorage.setItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE", source)
      setActiveSource(source)
    }
  }

  const downloadFileRef = useRef(null)
  async function downloadLibrary() {
    try {
        var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
        var libraryArrayString = localStorage.getItem(listKey)
        if (libraryArrayString) {
          const blob = new Blob([libraryArrayString], {type: 'application/json'})
          const href = window.URL.createObjectURL(blob)
          const link = downloadFileRef.current
          link.download = 'library.json'
          link.href = href
          link.click()
          link.href = '#'
        }
    } catch (e) {
      console.log(e.message)
    }
  }

  return (
    <div className="bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Setting</span>
        </div>
      </div>

      <div className="pt-4 mx-2">
        <div className="container mx-auto max-w-[1040px]">
          <div className="bg-[#fafafa] rounded p-4 mb-2 shadow-md">
            <h2 className="text-xl mb-2">Select Manga Source</h2>
            <span className="mb-2">Current Source: <span className="text-[#3db3f2] font-bold">{activeSource}</span></span>
            {sources.map((source, idx) => (
              <div key={idx}>
                <button
                  className="w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 items-center hover:disabled:bg-[#2b2d42] disabled:opacity-50 inline-flex justify-center"
                  onClick={() => changeMangaSource(source.id)}
                  disabled={!source.active}
                >
                  <img src={`/images/flags/${
                    {
                      "id": "indonesia.png",
                      "en": "united-kingdom.png",
                      "mix": "united-kingdom.png",
                    }[source.language]
                  }`} className="w-3 h-3" />
                  <span className="ml-2">{source.title}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-2 shadow-md">
            <h2 className="text-xl mb-2">Library</h2>
            <button
              className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center"
              onClick={() => {downloadLibrary()}}
            ><i class="fi fi-rr-download"></i> Download</button>
            <button
              className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center"
              onClick={() => {}}
            ><i class="fi fi-rr-upload"></i> Load From File</button>
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-2 shadow-md">
            <h2 className="text-xl mb-2">History</h2>
            <button
              className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center"
              onClick={() => {}}
            >Clear</button>
          </div>
        </div>
      </div>

      <a className="invisible" href="#" ref={downloadFileRef} target="_blank">_</a>

      <BottomMenuBar />
    </div>
  )
}
