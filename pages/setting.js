import { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import { useRouter } from "next/router"
import Link from 'next/link'
import { GoogleOAuthProvider, googleLogout, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

import BottomMenuBar from "../components/BottomMenuBar"
import animapuApi from "../apis/AnimapuApi"
import { toast } from 'react-toastify';
import { LogOutIcon } from 'lucide-react';

var version = "v3.8.0"

var sha512 = require('js-sha512').sha512

var onApiCall = false
var activeSourceIdxDirect = 0

var G_CLIENT_ID = "334886517586-djci4jil803sqjk042f6nne3016bngni.apps.googleusercontent.com"

export default function Setting() {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) { return }
    console.log("DARK", localStorage.getItem("ANIMAPU_LITE:DARK_MODE"), typeof(localStorage.getItem("ANIMAPU_LITE:DARK_MODE")))
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  let router = useRouter()

  const [sources, setSources] = useState([])
  const [activeSource, setActiveSource] = useState("")
  const [activeSourceIdx, setActiveSourceIdx] = useState(activeSourceIdxDirect)
  const [formattedSources, setFormattedSources] = useState([{value: "mangabat", label: "select source"}])
  const [panelbearDisable, setPanelbearDisable] = useState('false')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState({})

  async function GetSourceList() {
    if (onApiCall) {return}
    onApiCall = true
    try {
      const response = await animapuApi.GetSourceList({})
      const body = await response.json()
      if (response.status == 200) {
        setSources(body.data)
        setActiveSource(animapuApi.GetActiveMangaSource())

        var tempFormattedSources = body.data.map((source, idx) => {
          if (source.id === animapuApi.GetActiveMangaSource()) {
            activeSourceIdxDirect = idx
          }
            return {
              value: source.id,
              idx: idx,
              disabled: !source.active,
              label: <div className="flex flex-row justify-between">
                <div className="flex flex-row">
                  <img className="mr-2" src={`/images/flags/${source.language}.png`} alt="" height="15px" width="23px"/> {source.title}
                </div>
                <Link href={source.web_link || "#"} target="_blank">
                  <i className="fa-solid fa-up-right-from-square"></i>
                </Link>
              </div>
            }
        })
        setFormattedSources(tempFormattedSources)
      } else {
        toast.error(body.error.message)
      }
      onApiCall = false

    } catch (e) {
      toast.error(e.message)
      onApiCall = false
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPanelbearDisable(localStorage.getItem("panelbear_disable") || 'false')
    }
    GetSourceList()
    LoginCheck()
  }, [])

  useEffect(() => {
    setActiveSourceIdx(activeSourceIdxDirect)
  }, [formattedSources])

  function handleSelectSource(e) {
    if (typeof window !== "undefined") {
      setActiveSourceIdx(e.idx)
      localStorage.setItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE", e.value)
      setActiveSource(e.value)
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
      console.error(e.message)
    }
  }

  var loadLibraryPayload
  async function initLibraryFile(e) {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target.result)
      loadLibraryPayload = text
    }
    reader.readAsText(e.target.files[0])
  }

  function loadLibraryFile() {
    var listKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
    if (loadLibraryPayload && loadLibraryPayload !== "") {
      localStorage.setItem(listKey, loadLibraryPayload)
    }

    var libraryPayload = JSON.parse(loadLibraryPayload)

    libraryPayload.map((manga) => {
      var detailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
      localStorage.setItem(detailKey, JSON.stringify(manga))
    })

    toast.info("Info || Load library success!")
  }

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
      setLoggedInUser({
        email: decoded.email,
      })
      setLoggedIn(true)

      toast.info("Info || Login sukses!")
    } catch(e) {
      toast.error("Error", e)
    }
  }

  function GoogleLogoutCallback(response) {
    localStorage.removeItem("ANIMAPU_LITE:USER:LOGGED_IN")
    localStorage.removeItem("ANIMAPU_LITE:USER:UNIQUE_SHA")
    localStorage.removeItem("ANIMAPU_LITE:USER:EMAIL")
    setLoggedIn(false)
    toast.info("Info || Logout sukses!")
  }

  function LoginCheck() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") === "true") {
        setLoggedInUser({
          email: localStorage.getItem("ANIMAPU_LITE:USER:EMAIL"),
        })
        setLoggedIn(true)
      }
    }
  }

  function HandleSyncHistoryFromCloudToLocal() {
    // TODO: Implement sync mechanism
    toast.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  function HandleSyncHistoryFromLocalToCloud() {
    // TODO: Implement sync mechanism
    toast.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  function HandleSyncLibraryFromCloudToLocal() {
    // TODO: Implement sync mechanism
    toast.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  function HandleSyncLibraryFromLocalToCloud() {
    // TODO: Implement sync mechanism
    toast.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  return (
    <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[768px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Setting</span>
        </div>
      </div>

      <div className="pt-4 mx-2">
        <div className="container mx-auto max-w-[768px]">
          <div className="bg-[#fafafa] rounded p-4 mb-3 shadow-md">
            <h2 className="text-xl mb-2"><i className="fa fa-palette"></i> Theme</h2>
            <div className='flex'>
              <button
                className='block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mr-1 mt-2 p-2 text-center'
                onClick={()=>{
                  localStorage.setItem("ANIMAPU_LITE:DARK_MODE", "false")
                  setDarkMode(false)
                }}
              >
                <i className='fa fa-sun'></i> Light
              </button>
              <button
                className='block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded ml-1 mt-2 p-2 text-center'
                onClick={()=>{
                  localStorage.setItem("ANIMAPU_LITE:DARK_MODE", "true")
                  setDarkMode(true)
                }}
              >
                <i className='fa fa-moon'></i> Dark
              </button>
            </div>
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-3 shadow-md">
            <h2 className="text-xl mb-2"><i className="fa fa-globe"></i> Select Manga Source</h2>
            <span className="mb-2">Current Source: <span className="text-[#3db3f2] font-bold">{activeSource}</span></span>
            <Select
              id="select manga source"
              instanceId="select manga source"
              options={formattedSources}
              className=""
              onChange={(e) => handleSelectSource(e)}
              isOptionDisabled={(option) => option.disabled}
              value={formattedSources[activeSourceIdx]}
            />
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-3 shadow-md">
            <h2 className="text-xl mb-2"><i className="fa fa-user"></i> Profile</h2>

            <div>
              {
                !loggedIn ?
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
                 :
                <button
                  className="bg-red-500 text-white flex items-center gap-2 w-full text-center p-2 rounded"
                  onClick={()=>GoogleLogoutCallback()}
                ><LogOutIcon size={20} /> Logout</button>
              }
              <small>
                {
                  loggedIn ?
                  <>
                    Hello, <b>{loggedInUser.email}</b>
                  </> :
                  <>
                    you can login with google. we are not storing your email on our server, instead we use one way hashing algorithm to generate unique identifier based on google id and email.
                  </>
                }
              </small>
            </div>

            {
              loggedIn && <div>
                <div className="border-t mt-1">
                  <span>Sync History</span>
                  <div className="grid grid-cols-2">
                    <button
                      className="block bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mr-1 mt-2 p-2 text-center"
                      onClick={() => {HandleSyncHistoryFromCloudToLocal()}}
                    ><i className="fa-solid fa-cloud-arrow-down"></i> To Local</button>
                    <button
                      className="block bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded ml-1 mt-2 p-2 text-center"
                      onClick={() => {HandleSyncHistoryFromLocalToCloud()}}
                      ><i className="fa-solid fa-cloud-arrow-up"></i> To Cloud</button>
                  </div>
                </div>
                <div className="border-t mt-3">
                  <span>Sync Library</span>
                  <div className="grid grid-cols-2">
                    <button
                      className="block bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mr-1 mt-2 p-2 text-center"
                      onClick={() => {HandleSyncLibraryFromCloudToLocal()}}
                    ><i className="fa-solid fa-cloud-arrow-down"></i> To Local</button>
                    <button
                      className="block bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded ml-1 mt-2 p-2 text-center"
                      onClick={() => {HandleSyncLibraryFromLocalToCloud()}}
                      ><i className="fa-solid fa-cloud-arrow-up"></i> To Cloud</button>
                  </div>
                </div>
              </div>
            }
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-3 shadow-md">
            <h2 className="text-xl mb-2"><i className="fa-solid fa-book-bookmark"></i> Library</h2>
            <div>
              <button
                className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center"
                onClick={() => {downloadLibrary()}}
              ><i className="fa-solid fa-file-arrow-down"></i> Download</button>
            </div>
            <div>
              <span className="block mt-2">Load From File</span>
              <input
                className="p-2 text-center w-2/3 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" type="file"
                onChange={(e)=>initLibraryFile(e)}
              />
              <button
                className="w-1/3 bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center"
                onClick={() => {loadLibraryFile()}}
              ><i className="fa-solid fa-file-arrow-up"></i> Load</button>
            </div>
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-3 shadow-md">
            <h2 className="text-xl mb-2"><i className="fa-solid fa-clock-rotate-left"></i> History</h2>
            <button
              className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center"
              onClick={() => {
                if(confirm("Are you sure?")) {
                  localStorage.removeItem(`ANIMAPU_LITE:HISTORY:LOCAL:LIST`)
                }
                toast.info("Clear history success!")
              }}
            >Clear</button>
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-3 shadow-md">
            <h2 className="text-xl mb-2">Developer</h2>
            <Link href="/errlogs" className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center">
              Logs
            </Link>
            <a href="https://api.shadow-animapu-1.site/health" target="_blank" rel="noreferrer" className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center">
              API Host
            </a>
            <a href="https://console.firebase.google.com/u/1/project/animapu-api-firebase/database/animapu-api-firebase-default-rtdb/data" className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center">
              Fire Base
            </a>
            <a href="https://vercel.com/umarkotak/animapu-lite-nextjs/deployments" className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center">Vercel Deployment</a>
            <div>
              <span className="block mt-2 mb-2">
                Cronitor ({panelbearDisable === 'true' ? 'Off' : 'On'})
                <Link href={"https://cronitor.io/app/sites/5a31ef56f45643c0?env=production&time=7d&dimensionGroup=Pageviews"} target="_blank">
                  <i className="fa-solid fa-up-right-from-square"></i>
                </Link>
              </span>
              <div className="grid grid-cols-2">
                <a href="?panelbear_enable" className="bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center mr-1">On</a>
                <a href="?panelbear_disable" className="bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center ml-1">Off</a>
              </div>
            </div>
          </div>
        </div>

        <p className={`${darkMode ? "text-white" : "text-black"} text-center`}>Animapu Lite {version} | 2020 - 2022</p>
      </div>

      <a className="invisible" href="#" ref={downloadFileRef} target="_blank">_</a>

      <BottomMenuBar />
    </div>
  )
}
