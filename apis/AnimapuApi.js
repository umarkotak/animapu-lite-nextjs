class AnimapuApi {
  constructor() {
    // if (window.location.protocol === "https:") {
    //   this.AnimapuApiHost = "https://animapu-api.herokuapp.com"
    // } else {
    //   this.AnimapuApiHost = "http://localhost:6001"
    //   this.AnimapuApiHost = "https://animapu-api.herokuapp.com"
    // }

    this.AnimapuApiHost = "https://animapu-api.herokuapp.com"
    this.AnimapuApiHost = "https://animapu.site"
    // this.AnimapuApiHost = "http://localhost:6001"
  }

  async GetLatestManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/latest?page=${params.page}`
    // var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/latest?` + new URLSearchParams(params)
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

  async GetSourceList(params) {
    var uri = `${this.AnimapuApiHost}/mangas/sources`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response
  }

  async GetLogs(params) {
    var uri = `${this.AnimapuApiHost}/logs`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response
  }

  async GetPopularMangas(params) {
    var uri = `${this.AnimapuApiHost}/mangas/popular`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response
  }

  async PostUpvoteManga(params) {
    var uri = `${this.AnimapuApiHost}/mangas/upvote`
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
    return response
  }

  GetActiveMangaSource() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE")) {
        return localStorage.getItem("ANIMAPU_LITE:ACTIVE_MANGA_SOURCE")
      }
    }
    return "mangabat"
  }

  async PostUserHistories(user, params) {
    try {
      var uri = `${this.AnimapuApiHost}/users/mangas/histories`
      const response = await fetch(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Animapu-User-Uid': user.uid,
        },
        body: JSON.stringify(params)
      })
      return response
    } catch (e) {
      console.error(e)
      return {}
    }
  }

  async GetUserReadHistories(user) {
    var uri = `${this.AnimapuApiHost}/users/mangas/histories`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Animapu-User-Uid': user.uid,
      }
    })
    return response
  }
}

const animapuApi = new AnimapuApi()

export default animapuApi
