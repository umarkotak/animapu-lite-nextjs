import { v4 as uuidv4 } from 'uuid'

class AnimapuApi {
  constructor() {
    if (typeof(window) !== "undefined" && window.location.protocol === "https:") {
      this.GoHomeServerHost = "https://home-server-api.cloudflare-avatar-id-1.site"
      this.AnimapuApiHost = "https://animapu-api.cloudflare-avatar-id-1.site"
    } else {
      this.GoHomeServerHost = "https://home-server-api.cloudflare-avatar-id-1.site"
      this.AnimapuApiHost = "https://animapu-api.cloudflare-avatar-id-1.site"
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

  async DownloadMangaChapterPdf(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/read/${params.manga_id}/${params.chapter_id}/download_pdf`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  DownloadMangaChapterPdfUri(params) {
    return `${this.AnimapuApiHost}/mangas/${params.manga_source}/read/${params.manga_id}/${params.chapter_id}/manga_chapter.pdf`
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

  async GetAnimeSourceList(params) {
    var uri = `${this.AnimapuApiHost}/animes/sources`
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

  async GetUserMangaLibraries(params) {
    var uri = `${this.AnimapuApiHost}/users/mangas/libraries?sort=${params.sort}`
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

  async GetUserReadHistoriesV2(limit, page) {
    var uri = `${this.AnimapuApiHost}/users/mangas/histories_v2?limit=${limit}&page=${page}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetRandomAffiliateLinks(limit) {
    var uri = `${this.AnimapuApiHost}/affiliate_links/random?limit=${limit}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetAffiliateLinks(limit) {
    var uri = `${this.AnimapuApiHost}/affiliate_links?limit=${limit}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetUsersMangaActivities(limit) {
    var uri = `${this.AnimapuApiHost}/users/mangas/activities?limit=${limit}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetUsersAnimeActivities(limit) {
    var uri = `${this.AnimapuApiHost}/users/animes/activities?limit=${limit}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetAnimesBySeason(params) {
    var uri = `${this.AnimapuApiHost}/animes/${params.anime_source}/season/${params.year}/${params.season}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetLatestAnime(params) {
    var uri = `${this.AnimapuApiHost}/animes/${params.anime_source}/latest?page=${params.page}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetAnimeHistory(params) {
    var uri = `${this.AnimapuApiHost}/users/animes/histories`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetAnimeDetail(params) {
    var uri = `${this.AnimapuApiHost}/animes/${params.anime_source}/detail/${params.anime_id}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetAnimeWatch(params) {
    var uri = `${this.AnimapuApiHost}/animes/${params.anime_source}/watch/${params.anime_id}/${params.episode_id}?resolution=${params.resolution}&stream_idx=${params.stream_idx}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async SearchAnime(params) {
    var uri = `${this.AnimapuApiHost}/animes/${params.anime_source}/search?title=${params.title}&search_all=${params.search_all}`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async GetAnimeRandom(params) {
    var uri = `${this.AnimapuApiHost}/animes/${params.anime_source}/random`
    const response = await fetch(uri, {
      method: 'GET',
      headers: this.GenHeaders(),
    })
    return response
  }

  async PostAddTokopediaAffiliateLink(params) {
    var uri = `${this.AnimapuApiHost}/affiliate_links/tokopedia/add`
    const response = await fetch(uri, {
      method: 'POST',
      headers: this.GenHeaders(),
      body: JSON.stringify(params)
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

  GetActiveAnimeSource() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("ANIMAPU_LITE:ACTIVE_ANIME_SOURCE")) {
        return localStorage.getItem("ANIMAPU_LITE:ACTIVE_ANIME_SOURCE")
      }
    }
    return "otakudesu"
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
