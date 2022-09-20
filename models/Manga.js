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
  constructor(manga = {}, userId = "") {
    this.manga = manga
    this.userId = userId
  }

  GetOnlineHistoryKey() {
    return `ANIMAPU_LITE:HISTORY:ONLINE:DETAIL:${this.userId}:${this.manga.source}:${this.manga.source_id}:${this.manga.secondary_source_id}`
  }

  GetLocalHistoryKey() {
    return `ANIMAPU_LITE:HISTORY:LOCAL:DETAIL:${this.manga.source}:${this.manga.source_id}:${this.manga.secondary_source_id}`
  }
}

export default Manga
