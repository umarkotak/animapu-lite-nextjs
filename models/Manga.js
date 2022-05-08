// Properties:
// chapters: []
// cover_image: [{index: 1, image_urls: ["https://avt.mkklcdnv6temp.com/4/b/18-1583497236.jpg"]}]
// description: ""
// genres: []
// id: "read-ih387026"
// latest_chapter_id: "read-ih387026-chap-46"
// latest_chapter_number: 46
// latest_chapter_title: "Chapter 46: Page.46"
// rating: ""
// secondary_source: ""
// secondary_source_id: ""
// source: "mangabat"
// source_id: "read-ih387026"
// status: ""
// title: "Different Country Diary"

class Manga {
  constructor(manga = {}) {
    this.manga = manga
  }

  hello() {
    console.log("Hello there from", this.manga)
  }
}

export default Manga
