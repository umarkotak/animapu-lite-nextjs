import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Select from 'react-select'
import Link from 'next/link'
import useEventListener from "@use-it/event-listener";

var currentIdx = 0
export default function BottomMenuBar(props) {
  let router = useRouter()

  const [barMode, setBarMode] = useState("manga")
  const [isOpen, setIsOpen] = useState(props.isOpen || true)
  const [currentChapterIDX, setCurrentChapterIDX] = useState(0)
  const [chapters, setChapters] = useState([{ value: 'N/A', label: 'Pick Chapter' }])

  const customStyles = {
    control: base => ({
      ...base,
      height: "30px",
      minHeight: "30px"
    })
  }

  useEffect(() => {
    if (!props.manga || !props.chapter_id) {return}
    if (props.manga.chapters.length === 0) {return}
    var chapterOpts = props.manga.chapters.map((chapter, idx) => {
      if (props.chapter_id === chapter.id) {
        currentIdx = idx
      }
      return {
        value: `/mangas/${props.manga.source}/${props.manga.source_id}/read/${chapter.id}?secondary_source_id=${props.manga.secondary_source_id}`,
        label: chapter.title
      }
    })
    setChapters(chapterOpts)

  // eslint-disable-next-line
  }, [props])

  useEffect(() => {
    setCurrentChapterIDX(currentIdx)
  }, [chapters])

  function checkBar() {
    if (typeof window === "undefined") { return }
    if (window.location.pathname.startsWith("/anime")) {
      setBarMode("anime")
    }
  }

  useEffect(() => {
    checkBar()
  }, [])

  function handleSelectChapter(e) {
    if (!props.manga) { return "" }
    router.push(e.value)
  }

  function nextChapter() {
    if (!props.manga) { return "/#" }
    if (!chapters[currentIdx-1]) {
      return `/mangas/${props.manga.source}/${props.manga.source_id}?secondary_source_id=${props.manga.secondary_source_id}`
    }
    return chapters[currentIdx-1].value
  }

  function prevChapter() {
    if (!props.manga) { return "/#" }
    if (!chapters[currentIdx+1]) {
      return `/mangas/${props.manga.source}/${props.manga.source_id}?secondary_source_id=${props.manga.secondary_source_id}`
    }
    return chapters[currentIdx+1].value
  }

  function toManga() {
    if (!props.manga) { return "/#" }
    return `/mangas/${props.manga.source}/${props.manga.source_id}?secondary_source_id=${props.manga.secondary_source_id}`
  }

  const LEFT_KEYS = ["37", "ArrowLeft"]
  const RIGHT_KEYS = ["39", "ArrowRight"]

  var elem = ""
  if (typeof window !== "undefined") {
    elem = document
  }

  useEventListener(
    "keydown",
    ({ key }) => {
      if (LEFT_KEYS.includes(String(key))) {
        router.push(prevChapter())
      } else if (RIGHT_KEYS.includes(String(key))) {
        router.push(nextChapter())
      }
    },
    elem,
    { passive: true }
  )

  return(
    <>
      <div className={`${(props.isPaginateNavOn && props.isRead) ? "block" : "hidden"} container mx-auto pt-1 max-w-[1040px]`}>
        <div className="flex justify-between">
          <Link href={prevChapter()}>
            <a className="focus:text-teal-500 hover:text-teal-500 ml-1 mr-2 w-full bg-[#2b2d42] hover:bg-[#3db3f2] py-1 pr-1 rounded text-center">
              <i className="fa-solid fa-angle-left text-white"></i>
            </a>
          </Link>
          <Link href={nextChapter()}>
            <a className="focus:text-teal-500 hover:text-teal-500 mr-1 ml-2  w-full bg-[#2b2d42] hover:bg-[#3db3f2] py-1 pl-1 rounded text-center">
              <i className="fa-solid fa-angle-right text-white"></i>
            </a>
          </Link>
        </div>
      </div>

      <div className={`w-full flex justify-center fixed inset-x-0 bottom-0 z-10`}>
      {/* <div className={`w-full ${props.no_need_screen ? "" : "h-screen"}`}> */}
        { barMode === "manga" ? barManga() : barAnime() }
      </div>
    </>
  )

  function barManga() {
    return(
      <div className="block fixed inset-x-0 bottom-0 z-10">
        <div className={`fixed ${isOpen ? "bottom-[110px]" : "bottom-[45px]"} right-4`}>
          <button className="bg-[#2b2d42] bg-opacity-50 rounded-lg focus:text-teal-500 hover:text-teal-500 py-1 px-2" onClick={() => window.scrollTo(0, 0)}>
            <i className="fa-solid fa-angles-up text-white min-w-[15px]"></i>
          </button>
        </div>

        <div className="flex justify-between mx-4 mb-2">
          <div>
            <div className={`${(isOpen && props.isPaginateNavOn) ? "block" : "hidden"} bg-[#2b2d42] bg-opacity-50 py-1 px-1 rounded mr-1`}>
              <div className={`flex justify-between`}>
                <Link href={prevChapter()}>
                  <a className="focus:text-teal-500 hover:text-teal-500 mx-2">
                    <i className="fa-solid fa-angle-left text-white align-middle"></i>
                  </a>
                </Link>
                <Link href={toManga()}>
                  <a className="focus:text-teal-500 hover:text-teal-500 mx-2">
                    <i className="fa-solid fa-book text-white align-middle"></i>
                  </a>
                </Link>
                <Select
                  id="select manga chapter"
                  instanceId="select manga chapter"
                  options={chapters}
                  menuPlacement={"top"}
                  className="mx-2"
                  onChange={(e) => handleSelectChapter(e)}
                  defaultValue={chapters[currentIdx]}
                  value={chapters[currentIdx]}
                  styles={customStyles}
                />
                <Link href={nextChapter()}>
                  <a className="focus:text-teal-500 hover:text-teal-500 mx-1">
                    <i className="fa-solid fa-angle-right text-white align-middle"></i>
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className={`bg-[#2b2d42] bg-opacity-50 rounded-lg mr-1 ${isOpen ? "block" : "hidden"}`}>
              <div className="py-1 px-2">
                <Link href="/anime">
                  <a className="text-white hover:text-[#3db3f2]">
                    Manga
                  </a>
                </Link>
              </div>
            </div>
            <div className="bg-[#2b2d42] bg-opacity-50 rounded-lg ml-1">
              <button className="focus:text-teal-500 hover:text-teal-500 py-1 px-2" onClick={() => {setIsOpen(!isOpen)}}>
                <i className="fa-solid fa-bars text-white min-w-[15px]"></i>
              </button>
            </div>
          </div>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} bg-[#2b2d42] pb-2`}>
          <div className="flex justify-between container mx-auto max-w-[1040px]">
            <Link href="/">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-house"></i>
                <span className="tab tab-home block text-xs">Home</span>
              </a>
            </Link>
            <Link href="/search">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-magnifying-glass"></i>
                <span className="tab tab-home block text-xs">Search</span>
              </a>
            </Link>
            <Link href="/library">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-book-bookmark"></i>
                <span className="tab tab-home block text-xs">Library</span>
              </a>
            </Link>
            <Link href="/history">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span className="tab tab-home block text-xs">History</span>
              </a>
            </Link>
            <Link href="/setting">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-gear"></i>
                <span className="tab tab-home block text-xs">Setting</span>
              </a>
            </Link>
            {/* <Link href="/account">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-user"></i>
                <span className="tab tab-home block text-xs">Account</span>
              </a>
            </Link> */}
          </div>
        </div>
      </div>
    )
  }

  function barAnime() {
    return(
      <div className="block fixed inset-x-0 bottom-0 z-10">
        <div className="flex justify-end mx-4 mb-2">
          <div className="bg-[#2b2d42] bg-opacity-50 rounded-lg">
            <button className="focus:text-teal-500 hover:text-teal-500 py-1 px-2" onClick={() => window.scrollTo(0, 0)}>
              <i className="fa-solid fa-angles-up text-white min-w-[15px]"></i>
            </button>
          </div>
        </div>

        <div className="flex justify-between mx-4 mb-2">
          <div>
          </div>
          <div className="flex">
            <div className={`bg-[#2b2d42] bg-opacity-50 rounded-lg mr-1 ${isOpen ? "block" : "hidden"}`}>
              <div className="py-1 px-2">
                <Link href="/">
                  <a className="text-white hover:text-[#3db3f2]">
                    Anime
                  </a>
                </Link>
              </div>
            </div>
            <div className="bg-[#2b2d42] bg-opacity-50 rounded-lg ml-1">
              <button className="focus:text-teal-500 hover:text-teal-500 py-1 px-2" onClick={() => {setIsOpen(!isOpen)}}>
                <i className="fa-solid fa-bars text-white min-w-[15px]"></i>
              </button>
            </div>
          </div>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} bg-[#2b2d42] pb-2`}>
          <div className="flex justify-between container mx-auto max-w-[1040px]">
            <Link href="/anime">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-brands fa-edge"></i>
                <span className="tab tab-home block text-xs">Browse</span>
              </a>
            </Link>
            <Link href="/anime/watch/animepahe">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-p"></i>
                <span className="tab tab-home block text-xs">AnimePahe</span>
              </a>
            </Link>
            <Link href="/anime/watch/animeindo">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-i"></i>
                <span className="tab tab-home block text-xs">AnimeIndo</span>
              </a>
            </Link>
            <Link href="/anime/watch/animension">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-m"></i>
                <span className="tab tab-home block text-xs">Animension</span>
              </a>
            </Link>
            <Link href="/setting">
              <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
                <i className="fa-solid fa-gear"></i>
                <span className="tab tab-home block text-xs">Setting</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
