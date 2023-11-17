import { useState, useRef, useEffect } from 'react'
import autoAnimate from '@formkit/auto-animate'
import Link from 'next/link'

import animapuApi from "../apis/AnimapuApi"

var onApiCall = false
var activeSourceIdxDirect = 0
export default function ChangeSourceModalOnly(props) {
  const [show, setShow] = useState(props.show)
  const parent = useRef(null)

  const [formattedSources, setFormattedSources] = useState([{value: "mangabat", label: "select source"}])

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent])

  async function GetSourceList() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.GetSourceList({})
      const body = await response.json()
      if (response.status == 200) {
        var tempFormattedSources = body.data.filter(
          (source) => ( source.active )
        ).map((source, idx) => {
          if (source.id === animapuApi.GetActiveMangaSource()) {
            activeSourceIdxDirect = idx
          }
          return {
            value: source.id,
            idx: idx,
            disabled: !source.active,
            language: source.language,
            title: source.title,
            label: <div><div className="flex flex-row justify-between text-left">
              <div className="flex flex-row">
                <img className="mr-2 mt-1 h-[25px] w-[25px]" src={`/images/flags/${source.language}.png`} alt=""/>
                <div>
                  <span>{source.title}</span>
                  <div className='font-light mt-[-7px] mb-[-5px]'><small>{source.status}</small></div>
                </div>
              </div>
              <Link href={source.web_link || "#"} target="_blank">
                <a target="_blank"><i className="fa-solid fa-up-right-from-square"></i></a>
              </Link>
            </div></div>
          }
        })
        setFormattedSources(tempFormattedSources)
      } else {
        alert.error(body.error.message)
      }
      onApiCall = false

    } catch (e) {
      alert.error(e.message)
      onApiCall = false
    }
  }

  useEffect(() => {
    GetSourceList()
  // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setShow(props.show)
  // eslint-disable-next-line
  }, [props])

  function handleSelectSource(source) {
    if (typeof window !== "undefined") {
      localStorage.setItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE", source)
      window.location.reload()
    }
  }

  const closeModal = () => {
    setShow(false)
    props.onClose && props.onClose()
  }

  return(
    <div ref={parent}>
      <div
        tabIndex="-1"
        className={`fixed top-0 mt-[90px] inset-x-0 mx-auto z-20 justify-center items-center flex ${show ? "block" : "hidden"}`}
      >
        <div
          className={`fixed top-0 right-0 left-0 bg-black bg-opacity-70 h-screen w-full z-20 backdrop-blur-sm`}
          onClick={()=>{closeModal()}}>
        </div>
        <div className="relative p-4 w-full max-w-md h-full z-20">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                className="absolute z-10 top-3 right-2.5 bg-[#ec294b] text-white rounded-full text-sm py-1.5 px-2 inline-flex"
                onClick={()=>{closeModal()}}
              >
                <i className="fa fa-xmark"></i>
              </button>
              <div className="py-4 px-6 rounded-t border-b dark:border-gray-600">
                <h3 className="text-base font-semibold text-gray-900 lg:text-xl dark:text-white">
                  Select Manga Source
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Select your favorite source.</p>
                <div className="overflow-auto max-h-[450px]">
                  <ul className="my-4 space-y-3">
                    {formattedSources.map((oneSource) => (
                      <li key={oneSource.value}>
                        <button className="w-full items-center p-3 text-base font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
                          <div className="flex">
                            <span className="flex-1 ml-3 whitespace-nowrap" onClick={()=>handleSelectSource(oneSource.value)}>{oneSource.label}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <a href="#" className="inline-flex items-center text-xs font-normal text-gray-500 hover:underline dark:text-gray-400">
                    Scrapped by animapu
                  </a>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}
