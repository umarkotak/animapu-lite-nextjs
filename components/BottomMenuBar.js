import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Select from 'react-select'
import Link from 'next/link'

var currentIdx = 0
export default function BottomMenuBar(props) {
  let router = useRouter()

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
      return { value: `/mangas/${props.manga.source_id}/read/${chapter.id}?secondary_source_id=${props.manga.secondary_source_id}`, label: chapter.title }
    })
    setChapters(chapterOpts)
  // eslint-disable-next-line
  }, [props])

  useEffect(() => {
    setCurrentChapterIDX(currentIdx)
  }, [chapters])

  function handleSelectChapter(e) {
    if (!props.manga) { return "" }
    router.push(e.value)
  }

  function nextChapter() {
    if (!props.manga) { return "#" }
    if (!chapters[currentIdx-1]) { return "#" }
    return chapters[currentIdx-1].value
  }

  function prevChapter() {
    if (!props.manga) { return "#" }
    if (!chapters[currentIdx+1]) { return "#" }
    return chapters[currentIdx+1].value
  }

  function toManga() {
    if (!props.manga) { return "" }
    return `/mangas/${props.manga.source_id}?secondary_source_id=${props.manga.secondary_source_id}`
  }

  return(
    <div className="w-full h-screen pt-[120px]">
      <div className="h-[140px] mb-[-140px]">
        <img src="/images/bg-image.png" />
      </div>
      <div className="h-[140px] mb-[-140px] ml-[280px] mt-[100px]">
      </div>

      <div className={`${(isOpen && props.isPaginateNavOn) ? "block" : "hidden"} container mx-auto pt-1 max-w-[1040px]`}>
        <div className="flex justify-between">
          <Link href={prevChapter()}>
            <a className="focus:text-teal-500 hover:text-teal-500 mx-2 w-full bg-[#2b2d42] py-1 pr-1 rounded text-center">
              <i className="fi fi-rr-angle-left text-white" width="25" height="25"></i>
            </a>
          </Link>
          <Link href={nextChapter()}>
            <a className="focus:text-teal-500 hover:text-teal-500 mx-1 w-full bg-[#2b2d42] py-1 pl-1 rounded text-center">
              <i className="fi fi-rr-angle-right text-white" width="25" height="25"></i>
            </a>
          </Link>
        </div>
      </div>

      <div className="block fixed inset-x-0 bottom-0 z-10">
        <div className="flex justify-end mx-4 mb-2">
          <div className="bg-[#2b2d42] bg-opacity-50 py-1 px-2 rounded">
            <div className="h-1"></div>
            <button className="focus:text-teal-500 hover:text-teal-500" onClick={() => window.scrollTo(0, 0)}>
              <i className="fi fi-rr-angle-up text-white" width="25" height="25"></i>
            </button>
          </div>
        </div>

        <div className="flex justify-between mx-4 mb-2">
          <div>
            <div className={`${(isOpen && props.isPaginateNavOn) ? "block" : "hidden"} bg-[#2b2d42] bg-opacity-50 py-1 px-1 rounded`}>
              <div className={`flex justify-between`}>
                <Link href={prevChapter()}>
                  <a className="focus:text-teal-500 hover:text-teal-500 mx-2">
                    <i className="fi fi-rr-angle-left text-white" width="25" height="25"></i>
                  </a>
                </Link>
                <Link href={toManga()}>
                  <a className="focus:text-teal-500 hover:text-teal-500 mx-2">
                    <i className="fi fi-rr-book text-white" width="25" height="25"></i>
                  </a>
                </Link>
                <Select
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
                    <i className="fi fi-rr-angle-right text-white" width="25" height="25"></i>
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-[#2b2d42] bg-opacity-50 py-1 px-2 rounded">
            <div className="h-1"></div>
            <button className="focus:text-teal-500 hover:text-teal-500" onClick={() => {setIsOpen(!isOpen)}}>
              <i className="fi fi-rr-grid text-white" width="25" height="25"></i>
            </button>
          </div>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} flex justify-between bg-[#2b2d42] pb-2`}>
          <Link href="/">
            <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
              <i className="fi fi-rr-home" width="25" height="25"></i>
              <span className="tab tab-home block text-xs">Home</span>
            </a>
          </Link>
          <Link href="/search">
            <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
              <i className="fi fi-rr-search" width="25" height="25"></i>
              <span className="tab tab-home block text-xs">Search</span>
            </a>
          </Link>
          <Link href="/history">
            <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
              <i className="fi fi-rr-time-past" width="25" height="25"></i>
              <span className="tab tab-home block text-xs">History</span>
            </a>
          </Link>
          <Link href="/setting">
            <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
              <i className="fi fi-rr-settings" width="25" height="25"></i>
              <span className="tab tab-home block text-xs">Setting</span>
            </a>
          </Link>
          <Link href="/account">
            <a className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1">
              <i className="fi fi-rr-user" width="25" height="25"></i>
              <span className="tab tab-home block text-xs">Account</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}
