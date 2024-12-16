import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from "next/router"
import { Img } from 'react-image'
import Link from 'next/link'

import BottomMenuBar from "../../../../../components/BottomMenuBar"
import animapuApi from "../../../../../apis/AnimapuApi"
import Manga from "../../../../../models/Manga"

var baseChapters = []
var varTargetBottom = "none"
var quickLock = false
var currentSectionChapter = ""
var lastChapterLoadedMap = {}

export default function ReadManga(props) {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}
    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  let router = useRouter()
  const query = router.query

  var manga = props.manga
  const [chapter, setChapter] = useState({id: "", chapter_images: []})
  const [chapters, setChapters] = useState(baseChapters)

  const [successRender, setSuccessRender] = useState(0)
  const [historySaved, setHistorySaved] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") { return }
    if (!query.chapter_id) { return }
    getChapter()
    handleUpvote(false)

  }, [query])

  useEffect(() => {
    if (typeof window === "undefined") { return }
    if (!query.chapter_id) { return }

    recordLocalHistory()
    recordOnlineHistory()
  }, [chapter])

  async function getChapter() {
    try {
      const response = await animapuApi.GetReadManga({
        manga_source: query.manga_source,
        manga_id: query.id,
        chapter_id: query.chapter_id,
        secondary_source_id: query.secondary_source_id
      })
      const body = await response.json()
      if (response.status == 200) {
        baseChapters = []
        setChapter(body.data)
        baseChapters.push(body.data)
        varTargetBottom = `${body.data.id}-bottom`
        setChapters(baseChapters)
      } else {
        alert.error(`${body.error.error_code} || ${body.error.message} - automatically retrying`)

        getChapter()
      }
    } catch (e) {
      console.error(e)

      alert.error(`Unknown error ${e} - automatically retrying`)

      getChapter()
    }
  }

  function recordLocalHistory() {
    var historyMaxSize = 150

    try {
      var historyListKey = `ANIMAPU_LITE:HISTORY:LOCAL:LIST`
      var historyArrayString = localStorage.getItem(historyListKey)

      var historyArray
      if (historyArrayString) {
        historyArray = JSON.parse(historyArrayString)
      } else {
        historyArray = []
      }

      historyArray = historyArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${props.manga.source}-${props.manga.source_id}`))

      var tempManga = {...props.manga}
      tempManga.last_link = `/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}?secondary_source_id=${manga.secondary_source_id}`
      tempManga.last_chapter_read = chapter.number
      historyArray.unshift(tempManga)

      historyArray = historyArray.slice(0,historyMaxSize)

      historyArray = historyArray.map((val, idx) => {
        val.chapters = []
        val.description = ""
        return val
      })

      localStorage.setItem(historyListKey, JSON.stringify(historyArray))

      var historyDetailKey = `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
      localStorage.setItem(historyDetailKey, JSON.stringify(tempManga))

      setHistorySaved(true)
    } catch(e) {
      alert.error(e)
    }
  }

  async function recordOnlineHistory() {
    try {
      if (chapter && chapter.chapter_images.length <= 0) { return }

      if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") !== "true") { return }

      var tempManga = {...props.manga}
      tempManga.last_link = `/mangas/${manga.source}/${manga.source_id}/read/${chapter.id}?secondary_source_id=${manga.secondary_source_id}`
      tempManga.last_chapter_read = chapter.number

      var postUserHistoryParams = {
        "manga": tempManga
      }

      const response = await animapuApi.PostUserHistories({uid: localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA")}, postUserHistoryParams)

      if (response.status === 200) {
        var mangaObj = new Manga(tempManga, localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA"))
        localStorage.setItem(mangaObj.GetOnlineHistoryKey(), JSON.stringify(tempManga))
      }

    } catch (e)  {
      alert.error(e.message)
    }
  }

  async function handleUpvote(star) {
    if (!manga.source_id && !(typeof window !== "undefined")) { return }

    try {
      manga.star = star
      const response = await animapuApi.PostUpvoteManga(manga)
      const body = await response.json()
      if (response.status !== 200) {
        alert.error(`${body.error.error_code} || ${body.error.message}`)
        return
      }

      if (star) {
        alert.info("Info || Upvote sukses!")
      }

    } catch (e) {
      alert.error(e.message)
    }
  }

  function handleFollow() {
    if (!manga.source_id) { return }

    var followListKey = `ANIMAPU_LITE:FOLLOW:LOCAL:LIST`
    var libraryArrayString = localStorage.getItem(followListKey)

    var libraryArray
    if (libraryArrayString) {
      libraryArray = JSON.parse(libraryArrayString)
    } else {
      libraryArray = []
    }

    libraryArray = libraryArray.filter(arrManga => !(`${arrManga.source}-${arrManga.source_id}` === `${manga.source}-${manga.source_id}`))

    var tempManga = manga
    libraryArray.unshift(tempManga)

    localStorage.setItem(followListKey, JSON.stringify(libraryArray))

    var followDetailKey = `ANIMAPU_LITE:FOLLOW:LOCAL:DETAIL:${manga.source}:${manga.source_id}:${manga.secondary_source_id}`
    localStorage.setItem(followDetailKey, JSON.stringify(tempManga))
    alert.info("Info || Manga ini udah masuk library kamu!")
  }

  function isBottom(el) {
    if (!el) { return false }
    // Bigger mean more earlier to load
    return el.getBoundingClientRect().top <= 3500
  }

  async function getNextChapter(chapter_id) {
    try {
      const response = await animapuApi.GetReadManga({
        manga_source: query.manga_source,
        manga_id: query.id,
        chapter_id: chapter_id,
        secondary_source_id: query.secondary_source_id
      })
      const body = await response.json()
      if (response.status == 200) {
        if (baseChapters[baseChapters.length-1].id === body.data.id) {
          return
        }
        baseChapters = [...baseChapters, body.data]
        varTargetBottom = `${body.data.id}-bottom`
        setChapters(baseChapters)
      } else {
        alert.error(`${body.error.error_code} || ${body.error.message} - automatically retrying onepage`)

        getNextChapter(chapter_id)
      }
    } catch (e) {
      console.error(e)

      alert.error(`Unknown error ${e} - automatically retrying onepage`)

      getNextChapter(chapter_id)
    }
  }


  const handleScroll = () => {
    if (!document) { return }

    // $(".myCheckbox").prop('checked', true);
    // $('.myCheckbox').is(':checked');

    var elem = document.getElementById("one_page_toggle")

    if (!elem) { return }

    if (!elem.checked) { return }

    // var position = window.pageYOffset
    // var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight
    var wrappedElement = document.getElementById(varTargetBottom)

    var chID = varTargetBottom.replace('-bottom', '')
    if (isBottom(wrappedElement) && lastChapterLoadedMap[`${chID}`]) {
      varTargetBottom = "none"

      if (!quickLock) {
        try {
          quickLock = true

          var targetIdx = 0
          manga.chapters.map((tmpChapter, idx) => {
            if (tmpChapter.id === baseChapters[baseChapters.length-1].id) {
              targetIdx = idx - 1
            }
          })

          if (manga.chapters[targetIdx]) {
            getNextChapter(manga.chapters[targetIdx].id)
          }
        } finally {
          quickLock = false
        }
      }
    }

    // document.getElementById(`chap-70-bottom`).getBoundingClientRect().top

    if (baseChapters.length > 1) {
      var currentPosBoundary = ""
      var tmpOneChapter

      baseChapters.forEach((tmpBaseChapter, idx) => {
        var tmpBoundary = document.getElementById(`${tmpBaseChapter.id}-bottom`)
        if (tmpBoundary && tmpBoundary.getBoundingClientRect().bottom > 0 && currentPosBoundary === "") {
          currentPosBoundary = tmpBoundary
          tmpOneChapter = tmpBaseChapter
        }
      })

      if (currentPosBoundary !== "" && currentPosBoundary !== currentSectionChapter) {
        console.log(`CHANGING SECTION FROM ${currentSectionChapter} TO ${currentPosBoundary}`)

        currentSectionChapter = currentPosBoundary
        setChapter(tmpOneChapter)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  function shareUrlText() {
    var secondary_source = ""
    if (manga.secondary_source_id) {
      secondary_source = `secondary_source_id=${manga.secondary_source_id}`
    }
    return `Read *${manga.title}* - *Chapter ${chapter.number}* for free at https://animapu.vercel.app/mangas/${props.manga.source}/${props.manga.source_id}/read/${query.chapter_id}?${secondary_source}`
  }

  function anyChapterImageLoaded(oneChapter, idx, elemID) {
    var wrappedElement = document.getElementById(elemID)
    if (!wrappedElement) { return }

    lastChapterLoadedMap[oneChapter.id] = true
  }

  const [disqusData, setDisqusData] = useState({})

  async function GetDisqusDiscussion(disqusID) {
    try {
      const response = await animapuApi.GetDisqusDiscussion({
        disqus_id: disqusID,
      })
      const body = await response.json()
      if (response.status == 200) {
        console.log(body.data)
        setDisqusData(body.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (chapter?.generic_discussion?.disqus_id) {
      GetDisqusDiscussion(chapter?.generic_discussion?.disqus_id)
    }
  }, [chapter])

  return (
    <div className={`${darkMode ? "dark bg-stone-900" : "bg-[#d6e0ef]"} min-h-screen pb-60`}>
      <Head>
        {manga.title && <>
          <meta itemProp="description" content={`${props.manga.title}`} />
          <meta itemProp="image" content={`${props.manga.cover_image[0].image_urls[0]}`} />

          <meta name="og:title" content={`${props.manga.title}`} />
          <meta name="og:description" content={`Read manga with the best experience at animapu`} />
          <meta name="og:image" content={`${props.manga.cover_image[0].image_urls[0]}`} />

          <meta name="twitter:title" content={`${props.manga.title}`} />
          <meta name="twitter:description" content={`Read manga with the best experience at animapu`} />
          <meta name="twitter:image" content={`${props.manga.cover_image[0].image_urls[0]}`} />
        </>}
      </Head>

      <div>
        <div className="container mx-auto pt-1 px-1 max-w-[768px]">
          <div className="mt-1 mb-2">
            <div className="flex justify-start text-center text-xs">
              <Link
                href={chapter.source_link || "#"}
                className="bg-white hover:bg-sky-300 rounded-lg mr-1 p-1"
                target="_blank"
              >
                <i className="fa fa-globe"></i> Source
              </Link>
              <button
                className="bg-white hover:bg-sky-300 rounded-lg mr-1 p-1" onClick={() => handleFollow()}
              ><i className="fa-solid fa-heart"></i> Follow</button>
              <button
                className="bg-white hover:bg-sky-300 rounded-lg mr-1 p-1" onClick={() => handleUpvote(true)}
              ><i className="fa-solid fa-star"></i> Upvote</button>
              <button
                className="bg-white hover:bg-sky-300 rounded-lg mr-1 p-1"
                onClick={()=>{
                  navigator.clipboard.writeText(shareUrlText())
                  alert.info("Info || Link berhasil dicopy!")
                }}
              ><i className="fa-solid fa-share-nodes"></i> Share</button>
              {historySaved && <button
                className="bg-green-200 rounded-lg p-1 height-[27px]" disabled
              ><i className="fa-solid fa-clock-rotate-left"></i> Saved: {`ch ${chapter.number}`}</button>}
            </div>
            <div className="flex justify-start text-center text-xs mt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" id="one_page_toggle" defaultChecked={true} />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all  peer-checked:bg-blue-600"></div>
                <span className={`ml-1 text-sm font-medium ${ darkMode ? "text-white" : "text-gray-900"}`}> One page mode</span>
              </label>
            </div>
          </div>

          <div id="chapter_manga_image">
            {chapters.map((oneChapter, oneChIdx) => (
              <div key={`multi-ch-${oneChapter.id}-${oneChIdx}`}>
                <div
                  id={`${oneChapter.id}-top`}
                ></div>
                <hr className='border-black border-2 rounded mb-1'/>
                <div className='flex justify-start items-center bg-white rounded-full p-4'>
                  <p className='text-center font-semibold text-3xl'>~ Chapter: {oneChapter.number} ~</p>
                </div>
                <hr className='border-black border-2 rounded mb-2 mt-1'/>
                {/* FOR TESTING PURPOSE */}
                {/* <Img
                  className="w-full mb-1 bg-gray-600"
                  src={"https://v8.mkklcdnv6tempv3.com/img/tab_28/02/14/86/vi972843/vol16_chapter_124/1-o.jpg"}
                  decode={false}
                  loader={
                    <div className="my-1">
                      <svg role="status" className="mx-auto w-8 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                      </svg>
                    </div>
                  }
                /> */}
                {oneChapter.chapter_images.map((imageObj, idx) => (
                  <div
                    id={`${oneChapter.id}---${idx}`}
                    // id={`${oneChapter.id}-${idx} ${oneChapter.chapter_images.length-1===idx ? `${oneChapter.id}-final` : ""}`}
                    key={`${oneChapter.id}-${idx}`}
                    onLoad={()=>anyChapterImageLoaded(oneChapter, idx, `${oneChapter.id}---${idx}`)}
                    className='flex w-full justify-center'
                  >
                    {
                      !imageObj.simple_render ?
                        <Img
                          className="w-full max-w-[800px] mb-1 bg-gray-600"
                          src={imageObj.image_urls}
                          onLoad={()=>{setSuccessRender(1)}}
                          onError={()=>{}}
                          decode={false}
                          loader={
                            <div className="my-1">
                              <svg role="status" className="mx-auto w-8 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                              </svg>
                            </div>
                        }/>
                      :
                        <>
                          <img
                            className="w-full max-w-[800px] mb-1 bg-gray-600"
                            loading="lazy"
                            src={imageObj.image_urls[0]}
                          />
                        </>
                    }
                  </div>
                ))}
                <div className="mt-1 mb-2 p-2 rounded-lg text-black overflow-auto max-h-96">
                  {
                    disqusData.code >= 0 ? <>
                      <div className='mb-4'>
                        <span className={`text-xl font-bold ${ darkMode ? "text-white" : "text-black"}`}>Discussion</span>
                      </div>
                      {disqusData.response.posts && disqusData.response.posts.map((onePost) => (
                        <div className='border bg-white p-2 mb-4 rounded-xl flex' style={{marginLeft: `${onePost.depth * 0}px`}} key={onePost.id}>
                          <img src={onePost.author.avatar.cache} className='flex-none w-12 h-12 rounded-xl mr-2' alt="avatar" />
                          <div>
                            <b>{onePost.author.name}</b>
                            <p dangerouslySetInnerHTML={{ __html: onePost.message }}></p>
                            {onePost.media.map((oneMedia) => (
                              <>
                                <img src={oneMedia.location} className='rounded-xl w-1/2' />
                              </>
                            ))}
                          </div>
                        </div>
                      ))}
                    </> : <>

                    </>
                  }
                </div>
                <div
                  id={`${oneChapter.id}-bottom`}
                ><hr/></div>
                <div
                  className='h-[150px] bg-gradient-to-b from-blue-400 to-transparent'
                ></div>
              </div>
            ))}
          </div>

          <p className="text-center">
            <Link href={chapter.source_link || "#"} target="_blank" className={`hover:text-[#3db3f2] ${ darkMode ? "text-white" : ""}`}>
              <b><i className="fa fa-globe"></i> Read from original source</b>
            </Link>
          </p>
          {successRender ? null : <div>
            <p className={`text-center ${ darkMode ? "text-white" : ""}`}>
              please wait for at most 1 minute, or the image might be broken. sorry for the inconvenience.
            </p>
          </div>}
        </div>
      </div>

      <BottomMenuBar isPaginateNavOn={true} isRead={true} manga={manga} chapter_id={chapter.id} />
    </div>
  )
}

export async function getServerSideProps(context) {
  var query = context.query

  var manga = {}
  var chapter = {}

  try {
    const response = await animapuApi.GetMangaDetail({
      manga_source: query.manga_source,
      manga_id: query.id,
      secondary_source_id: query.secondary_source_id
    })
    const body = await response.json()
    if (response.status == 200) {
      manga = body.data
    }

  } catch (e) {
    console.error(e)
  }

  return { props: { manga: manga, chapter: chapter } }
}
