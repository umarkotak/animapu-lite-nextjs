import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Select from 'react-select'

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
    window.scrollTo(0, 0)
    router.push(e.value)
  }

  function nextChapter() {
    window.scrollTo(0, 0)
    if (!chapters[currentIdx-1]) { return }
    router.push(chapters[currentIdx-1].value)
  }

  function prevChapter() {
    window.scrollTo(0, 0)
    if (!chapters[currentIdx+1]) { return }
    router.push(chapters[currentIdx+1].value)
  }

  return(
    <div className="w-full h-screen">
      <div className={`${(isOpen && props.isPaginateNavOn) ? "block" : "hidden"} container mx-auto pt-1 max-w-[1040px]`}>
        <div className="flex justify-between">
          <button className="focus:text-teal-500 hover:text-teal-500 mx-2 w-full bg-[#2b2d42] py-1 pr-1 rounded">
            <i className="fi fi-rr-angle-left text-white" width="25" height="25" onClick={()=>prevChapter()}></i>
          </button>
          <button className="focus:text-teal-500 hover:text-teal-500 mx-1 w-full bg-[#2b2d42] py-1 pl-1 rounded">
            <i className="fi fi-rr-angle-right text-white" width="25" height="25" onClick={()=>nextChapter()}></i>
          </button>
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
                <button className="focus:text-teal-500 hover:text-teal-500 mx-2">
                  <i className="fi fi-rr-angle-left text-white" width="25" height="25" onClick={()=>prevChapter()}></i>
                </button>
                <button className="focus:text-teal-500 hover:text-teal-500 mx-2">
                  <i className="fi fi-rr-book text-white" width="25" height="25"></i>
                </button>
                <Select
                  options={chapters}
                  menuPlacement={"top"}
                  className="mx-2"
                  onChange={(e) => handleSelectChapter(e)}
                  defaultValue={chapters[currentIdx]}
                  value={chapters[currentIdx]}
                  styles={customStyles}
                />
                <button className="focus:text-teal-500 hover:text-teal-500 mx-1">
                  <i className="fi fi-rr-angle-right text-white" width="25" height="25" onClick={()=>nextChapter()}></i>
                </button>
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
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/")}>
            <i className="fi fi-rr-home" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Home</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/search")}>
            <i className="fi fi-rr-search" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Search</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/history")}>
            <i className="fi fi-rr-time-past" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">History</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/setting")}>
            <i className="fi fi-rr-settings" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Setting</span>
          </button>
          <button className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] text-center pt-2 pb-1" onClick={() => router.push("/account")}>
            <i className="fi fi-rr-user" width="25" height="25"></i>
            <span className="tab tab-home block text-xs">Account</span>
          </button>
        </div>
      </div>
    </div>
  )
}
