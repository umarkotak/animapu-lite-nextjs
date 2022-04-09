import '../styles/globals.css'
import '../styles/uicons-regular-rounded.css'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <head>
        <title>Animapu - Lite</title>
        <meta name="description" content="Baca komik gratis tanpa iklan" />

        <meta itemProp="name" content="Animapu - Lite" />
        <meta itemProp="description" content="Baca komik gratis tanpa iklan" />
        <meta itemProp="image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />

        <meta name="og:site_name" property="og:site_name" content="Animapu - Lite" />
        <meta name="og:title" property="og:title" content="Animapu - Lite" />
        <meta name="og:url" property="og:url" content="https://animapu-lite.vercel.app/" />
        <meta name="og:type" property="og:type" content="website" />
        <meta name="og:description" property="og:description" content="Baca komik gratis tanpa iklan" />
        <meta name="og:image" property="og:image" itemProp="image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />
        <meta name="og:updated_time" property="og:updated_time" content="1649491674" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Animapu - Lite" />
        <meta name="twitter:description" content="Baca komik gratis tanpa iklan" />
        <meta name="twitter:image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />
      </head>

      <Component {...pageProps} />
    </>
  )
}

export default MyApp
