import { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import { useRouter } from "next/router"
import Link from 'next/link'
import { useAlert } from 'react-alert'
import { GoogleLogin, GoogleLogout } from 'react-google-login'

import BottomMenuBar from "../components/BottomMenuBar"
import animapuApi from "../apis/AnimapuApi"

var sha512 = require('js-sha512').sha512

var onApiCall = false
var activeSourceIdxDirect = 0

var G_CLIENT_ID = "334886517586-djci4jil803sqjk042f6nne3016bngni.apps.googleusercontent.com"

export default function Setting() {
  const alert = useAlert()
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
      console.log(body)
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
                  <a target="_blank"><i className="fa-solid fa-up-right-from-square"></i></a>
                </Link>
              </div>
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
    if (typeof window !== "undefined") {
      console.log("PANEL", localStorage.getItem("panelbear_disable"))
      setPanelbearDisable(localStorage.getItem("panelbear_disable") || 'false')
    }
    GetSourceList()
    LoginCheck()
  // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setActiveSourceIdx(activeSourceIdxDirect)
  // eslint-disable-next-line
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
      console.log(e.message)
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
    alert.info("Load library success!")
  }

  function GoogleLoginCallback(response) {
    var googleData = response

    if (googleData.googleId) {
      var initialString = `${googleData.googleId}-${googleData.profileObj.email}`
      localStorage.setItem("ANIMAPU_LITE:USER:LOGGED_IN", "true")
      localStorage.setItem("ANIMAPU_LITE:USER:UNIQUE_SHA", sha512(initialString))
      localStorage.setItem("ANIMAPU_LITE:USER:EMAIL", googleData.profileObj.email)
      setLoggedInUser({
        email: googleData.profileObj.email,
      })
      setLoggedIn(true)
    }

    alert.info("Info || Login sukses!")
  }

  function GoogleLogoutCallback(response) {
    localStorage.removeItem("ANIMAPU_LITE:USER:LOGGED_IN")
    localStorage.removeItem("ANIMAPU_LITE:USER:UNIQUE_SHA")
    localStorage.removeItem("ANIMAPU_LITE:USER:EMAIL")
    setLoggedIn(false)
    alert.info("Info || Logout sukses!")
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
    alert.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  function HandleSyncHistoryFromLocalToCloud() {
    // TODO: Implement sync mechanism
    alert.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  function HandleSyncLibraryFromCloudToLocal() {
    // TODO: Implement sync mechanism
    alert.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  function HandleSyncLibraryFromLocalToCloud() {
    // TODO: Implement sync mechanism
    alert.error("Error || Maaf, fitur ini masih dalam pengerjaan")
  }

  return (
    <div className="min-h-screen pb-60 bg-[#d6e0ef]">
      <div className="bg-[#2b2d42] h-[140px] mb-[-100px]">
        <div className="container mx-auto max-w-[1040px] pt-2">
          <span className="px-4 mb-4 text-white text-xl">Setting</span>
        </div>
      </div>

      <div className="pt-4 mx-2">
        <div className="container mx-auto max-w-[1040px]">
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
                <GoogleLogin
                  className="block w-full text-center"
                  clientId={G_CLIENT_ID}
                  buttonText="Continue With Google"
                  onSuccess={GoogleLoginCallback}
                  onFailure={GoogleLoginCallback}
                  cookiePolicy={'single_host_origin'}
                /> :
                <GoogleLogout
                  className="block w-full text-center"
                  clientId={G_CLIENT_ID}
                  buttonText="Logout"
                  onLogoutSuccess={GoogleLogoutCallback}
                />
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
                alert.info("Clear history success!")
              }}
            >Clear</button>
          </div>

          <div className="bg-[#fafafa] rounded p-4 mb-3 shadow-md">
            <h2 className="text-xl mb-2">Developer</h2>
            <Link href="/errlogs">
              <a className="block w-full bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center">Logs</a>
            </Link>
            <div>
              <span className="block mt-2 mb-2">
                PanelBear ({panelbearDisable === 'true' ? 'Off' : 'On'})
                <Link href={"https://app.panelbear.com/sites/1ldX7qgR0Bq/traffic/?period=7d&timeseriesCompareDimension=event_count"} target="_blank">
                  <a target="_blank"> <i className="fa-solid fa-up-right-from-square"></i></a>
                </Link>
              </span>
              <div className="grid grid-cols-2">
                <a href="?panelbear_enable" className="bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center mr-1">On</a>
                <a href="?panelbear_disable" className="bg-[#2b2d42] hover:bg-[#3db3f2] text-white rounded mt-2 p-2 text-center ml-1">Off</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a className="invisible" href="#" ref={downloadFileRef} target="_blank">_</a>

      <BottomMenuBar />
    </div>
  )
}
