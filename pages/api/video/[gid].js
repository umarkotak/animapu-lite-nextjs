const FORWARDED_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "cache-control",
]

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).end()
  }

  const { gid } = req.query
  const accessToken = Array.isArray(req.query.access_token)
    ? req.query.access_token[0]
    : req.query.access_token

  if (!gid || Array.isArray(gid) || !accessToken) {
    return res.status(400).json({
      error: "Both a Google Drive file ID and access token are required.",
    })
  }

  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "*/*",
    }

    if (req.headers.range) headers.Range = req.headers.range

    const upstream = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(gid)}?alt=media`,
      { headers, redirect: "follow" }
    )

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).send(await upstream.text())
    }

    FORWARDED_HEADERS.forEach((header) => {
      const value = upstream.headers.get(header)
      if (value) res.setHeader(header, value)
    })
    res.status(upstream.status)

    if (!upstream.body) return res.end()

    const reader = upstream.body.getReader()
    req.on("close", () => reader.cancel().catch(() => {}))

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!res.write(Buffer.from(value))) {
        await new Promise((resolve) => res.once("drain", resolve))
      }
    }

    res.end()
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Unable to stream video." })
    } else {
      res.end()
    }
  }
}
