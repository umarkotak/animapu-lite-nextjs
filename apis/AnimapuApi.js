class AnimapuApi {
  constructor() {
    // if (window.location.protocol === "https:") {
    //   this.AnimapuApiHost = "https://animapu-api.herokuapp.com"
    // } else {
      this.AnimapuApiHost = "http://localhost:6001"
      this.AnimapuApiHost = "https://animapu-api.herokuapp.com"
    // }
  }

  async GetLatestManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/latest?page=${params.page}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response
  }

  async GetMangaDetail(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/detail/${params.manga_id}?secondary_source_id=${params.secondary_source_id}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response
  }

  async GetReadManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/read/${params.manga_id}/${params.chapter_id}?secondary_source_id=${params.secondary_source_id}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response
  }

  async SearchManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/search?title=${params.title}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response
  }

  GetActiveMangaSource() {
    return "mangaupdates"
  }

}

const animapuApi = new AnimapuApi()

export default animapuApi
