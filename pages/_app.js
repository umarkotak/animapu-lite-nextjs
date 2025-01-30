import '../styles/globals.css'
import Head from 'next/head'
import NProgress from 'nprogress'
import "nprogress/nprogress.css"
import Router from 'next/router'
import Script from 'next/script'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCronitor } from '@cronitorio/cronitor-rum-nextjs';
import { ThemeProvider } from 'next-themes'

// NProgress.configure({
//   minimum: 0.3,
//   easing: 'ease',
//   speed: 800,
//   showSpinner: true,
// })

// Router.events.on('routeChangeStart', () => NProgress.start())
// Router.events.on('routeChangeComplete', () => NProgress.done())
// Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }) {
  useCronitor('7aedc8d5a68c296cfc670b4719b4f4c6');

  return (
    <>
      <Head>
        <title>Animapu - Lite</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Baca komik gratis tanpa iklan" />

        <meta itemProp="name" content="Animapu - Lite" />
        <meta itemProp="description" content="Baca komik gratis tanpa iklan" />
        <meta itemProp="image" content="https://animapu.vercel.app/images/cover.jpeg" />

        <link rel='manifest' href='/manifest.json' />

        <meta name="og:url" content="https://animapu.vercel.app/" />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Animapu - Lite" />
        <meta name="og:description" content="Baca komik gratis tanpa iklan" />
        <meta name="og:image" content="https://animapu.vercel.app/images/cover.jpeg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Animapu - Lite" />
        <meta name="twitter:description" content="Baca komik gratis tanpa iklan" />
        <meta name="twitter:image" content="https://animapu.vercel.app/images/cover.jpeg" />
      </Head>

      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <Component {...pageProps} />
      </ThemeProvider>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default MyApp
