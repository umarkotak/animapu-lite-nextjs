import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const originalRenderPage = ctx.renderPage

    // Run the React rendering logic synchronously
    ctx.renderPage = () =>
      originalRenderPage({
        // Useful for wrapping the whole react tree
        enhanceApp: (App) => App,
        // Useful for wrapping in a per-page basis
        enhanceComponent: (Component) => Component,
      })

    // Run the parent `getInitialProps`, it now includes the custom `renderPage`
    const initialProps = await Document.getInitialProps(ctx)

    return initialProps
  }

  render() {
    return (
      <Html>
        <Head>
          <title>Animapu - Lite</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content="Baca komik gratis tanpa iklan" />

          <meta itemProp="name" content="Animapu - Lite" />
          <meta itemProp="description" content="Baca komik gratis tanpa iklan" />
          <meta itemProp="image" content="https://animapu-lite.vercel.app/images/cover.jpeg" />

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
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument