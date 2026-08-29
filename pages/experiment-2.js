import Head from "next/head"
import { useMemo, useState } from "react"

export default function ExperimentTwo() {
  const [accessToken, setAccessToken] = useState("")
  const [gid, setGid] = useState("")
  const [loaded, setLoaded] = useState(false)

  const videoUrl = useMemo(() => {
    if (!loaded || !accessToken || !gid) return ""
    return `/api/video/${encodeURIComponent(gid)}?${new URLSearchParams({
      access_token: accessToken,
    })}`
  }, [accessToken, gid, loaded])

  function loadVideo(event) {
    event.preventDefault()
    setLoaded(Boolean(accessToken && gid))
  }

  return (
    <>
      <Head>
        <title>Google Drive video experiment</title>
      </Head>

      <main className="min-h-screen bg-[#d6e0ef] p-4 text-slate-900">
        <section className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold">Google Drive video player</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter a Google Drive file ID and a temporary OAuth access token.
          </p>

          <form className="mt-6 space-y-4" onSubmit={loadVideo}>
            <label className="block text-sm font-medium">
              Google Drive file ID
              <input
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={gid}
                onChange={(event) => {
                  setGid(event.target.value)
                  setLoaded(false)
                }}
                placeholder="1Nn95gZYcs-bqztb6C3qjyAezvhwpaXyW"
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Google OAuth access token
              <textarea
                className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2"
                value={accessToken}
                onChange={(event) => {
                  setAccessToken(event.target.value)
                  setLoaded(false)
                }}
                placeholder="ya29..."
                required
              />
            </label>

            <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
              Load video
            </button>
          </form>

          {videoUrl && (
            <video className="mt-6 w-full" controls playsInline preload="metadata" src={videoUrl} />
          )}
        </section>
      </main>
    </>
  )
}
