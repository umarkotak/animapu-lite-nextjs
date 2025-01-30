import { v4 as uuidv4 } from 'uuid'

class AnimapuApi {
  constructor() {
    if (typeof(window) !== "undefined" && window.location.protocol === "https:") {
      this.AnimapuApiHost = "https://animapu-api-m4.cloudflare-avatar-id-1.site"
    } else {
      this.AnimapuApiHost = "https://animapu-api-m4.cloudflare-avatar-id-1.site"
      // this.AnimapuApiHost = "http://localhost:6001"
    }
  }

  async GetLatestManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/latest?page=${params.page}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetMangaDetail(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/detail/${params.manga_id}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetReadManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/read/${params.manga_id}/${params.chapter_id}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async SearchManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/search?title=${params.title}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetSourceList(params) {
    var uri = `${this.AnimapuApiHost}/mangas/sources`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetLogs(params) {
    var uri = `${this.AnimapuApiHost}/logs`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetPopularMangas(params) {
    var uri = `${this.AnimapuApiHost}/mangas/popular`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async PostUpvoteManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/upvote`
    const response = await fetch(uri, {
      method: 'POST',
      headers: this.GenHeaders(),
      body: JSON.stringify(params)
    })
    return response
  }

  async PostAddMangaToLibrary(params) {
    var uri = `${this.AnimapuApiHost}/users/mangas/libraries/${params.source}/${params.source_id}/add`
    const response = await fetch(uri, {
      method: 'POST',
      headers: this.GenHeaders(),
      body: JSON.stringify(params)
    })
    return response
  }

  async PostRemoveMangaFromLibrary(params) {
    var uri = `${this.AnimapuApiHost}/users/mangas/libraries/${params.source}/${params.source_id}/remove`
    const response = await fetch(uri, {
      method: 'POST',
      headers: this.GenHeaders(),
      body: JSON.stringify(params)
    })
    return response
  }

  async GetUserMangaLibraries() {
    var uri = `${this.AnimapuApiHost}/users/mangas/libraries`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async PostUserHistories(params) {
    try {
      var uri = `${this.AnimapuApiHost}/users/mangas/histories`
      const response = await fetch(uri, {
        method: 'POST',
        headers: this.GenHeaders(),
        body: JSON.stringify(params)
      })
      return response
    } catch (e) {
      console.error(e)
      return {}
    }
  }

  async GetUserReadHistories() {
    var uri = `${this.AnimapuApiHost}/users/mangas/histories`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetUserReadHistoriesV2() {
    var uri = `${this.AnimapuApiHost}/users/mangas/histories_v2`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  GenHeaders() {
    var user = this.GetUserLogin()

    return {
      'Content-Type': 'application/json',
      'Animapu-User-Uid': user.uid,
      'Animapu-User-Email': user.email,
      'X-Visitor-Id': this.GetVisitorID(),
      'X-From-Path': this.GetFromPath(),
    }
  }

  GetActiveMangaSource() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE")) {
        return localStorage.getItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE")
      }
    }
    return "mangabat"
  }

  GetVisitorID() {
    if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")) {
      return localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")
    }

    if (typeof window !== "undefined" && !localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")) {
      var visitorID = `VISITOR_ID:${uuidv4()}`
      localStorage.setItem("ANIMAPU_LITE:VISITOR_ID", visitorID)
      return visitorID
    }

    return ""
  }

  GetUserLogin() {
    if (typeof window !== "undefined" && localStorage) {
      return {
        "logged_in": localStorage.getItem("ANIMAPU_LITE:USER:LOGGED_IN") || "",
        "uid": localStorage.getItem("ANIMAPU_LITE:USER:UNIQUE_SHA") || "",
        "email": localStorage.getItem("ANIMAPU_LITE:USER:EMAIL") || "",
      }
    }

    return {
      "logged_in": "",
      "uid": "",
      "email": "",
    }
  }

  GetFromPath() {
    if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")) {
      return window.location.href
    }
    return ""
  }
}

const animapuApi = new AnimapuApi()

export default animapuApi
