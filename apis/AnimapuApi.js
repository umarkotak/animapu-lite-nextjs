class AnimapuApi {
  constructor() {
    if (typeof(window) !== "undefined" && window.location.protocol === "https:") {
      this.AnimapuApiHost = "https://animapu-api-m4.cloudflare-avatar-id-1.site"
    } else {
      this.AnimapuApiHost = "https://animapu-api-m4.cloudflare-avatar-id-1.site"
      // this.AnimapuApiHost = "http://localhost:6001"
    }

    this.AnimapuLambdaHost = "https://animapu-lite-lambda.vercel.app"
  }

  async GetLatestManga(params) {
    if (params.use_lambda) {
      var uri = `${this.AnimapuLambdaHost}/mangas/${params.manga_source}/latest?page=${params.page}`
    } else {
      var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/latest?page=${params.page}`
    }
    // var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/latest?` + new URLSearchParams(params)
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
      }
    })
    return response
  }

  async GetMangaDetail(params) {
    if (params.use_lambda) {
      var uri = `${this.AnimapuLambdaHost}/mangas/${params.manga_source}/detail/${params.manga_id}`
    } else {
      var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/detail/${params.manga_id}`
    }
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
      }
    })
    return response
  }

  async GetReadManga(params) {
    if (params.use_lambda) {
      var uri = `${this.AnimapuLambdaHost}/mangas/${params.manga_source}/read/${params.manga_id}/${params.chapter_id}`
    } else {
      var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/read/${params.manga_id}/${params.chapter_id}`
    }
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
      }
    })
    return response
  }

  async SearchManga(params) {
    if (params.use_lambda) {
      var uri = `${this.AnimapuLambdaHost}/mangas/${params.manga_source}/search?title=${params.title}`
    } else {
      var uri = `${this.AnimapuApiHost}/mangas/${params.manga_source}/search?title=${params.title}`
    }
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
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
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
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
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
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
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
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
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
      },
      body: JSON.stringify(params)
    })
    return response
  }

  async PostFollowManga(user, params) {
    var uri = `${this.AnimapuApiHost}/mangas/follow`
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Animapu-User-Uid': user.uid,
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
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
          'X-Visitor-Id': this.GetVisitorID(),
          'X-From-Path': this.GetFromPath(),
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
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
      }
    })
    return response
  }

  async GetDisqusDiscussion(params) {
    var uri = `${this.AnimapuApiHost}/mangas/comments/disqus?` + new URLSearchParams(params)
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Visitor-Id': this.GetVisitorID(),
        'X-From-Path': this.GetFromPath(),
      }
    })
    return response
  }

  GetVisitorID() {
    if (typeof window !== "undefined" && localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")) {
      return localStorage.getItem("ANIMAPU_LITE:VISITOR_ID")
    }
    return ""
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
