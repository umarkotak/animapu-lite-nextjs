import '../styles/globals.css'
import Head from 'next/head'
import NProgress from 'nprogress'
import "nprogress/nprogress.css"
import Router from 'next/router'
import { usePanelbear } from '@panelbear/panelbear-nextjs'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'

NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: true,
})

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }) {
  usePanelbear('1ldX7qgR0Bq', {
    // debug: true,
  })

  const AlertTemplate = ({ style, options, message, close }) => {
    var title = "Error"
    var description = message
    var tempArr = message.split(" || ")
    if (tempArr.length >= 2) {
      title = tempArr[0]
      description = tempArr[1]
    }

    if (options.type === "info" || options.type === "success") {
      return(
        <div className={`bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative`} role="info" style={style} onClick={close}>
          <strong className="font-bold">{title + ": "}</strong>
          <span className="block sm:inline">{description}</span>
        </div>
      )
    } else {
      return(
        <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative`} role="alert" style={style} onClick={close}>
          <strong className="font-bold">{title + ": "}</strong>
          <span className="block sm:inline">{description}</span>
        </div>
      )
    }
  }

  const options = {
    position: positions.BOTTOM_CENTER,
    timeout: 5000,
    offset: '-55px 30px 75px 30px',
    transition: transitions.FADE
  }

  return (
    <>
      <Head>
        <title>Animapu - Lite</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Baca komik gratis tanpa iklan" />

        <meta itemProp="name" content="Animapu - Lite" />
        <meta itemProp="description" content="Baca komik gratis tanpa iklan" />
        <meta itemProp="image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />

        <link rel='manifest' href='/manifest.json' />

        <meta name="og:url" content="https://animapu-lite.vercel.app/" />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Animapu - Lite" />
        <meta name="og:description" content="Baca komik gratis tanpa iklan" />
        <meta name="og:image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Animapu - Lite" />
        <meta name="twitter:description" content="Baca komik gratis tanpa iklan" />
        <meta name="twitter:image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />
      </Head>

      <AlertProvider template={AlertTemplate} {...options}>
        <Component {...pageProps} />
      </AlertProvider>
    </>
  )
}

export default MyApp
