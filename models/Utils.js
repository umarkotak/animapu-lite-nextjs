class Utils {
  constructor() {
  }

  Slugify(text) {
    text = `${text}`
    return text
      .toLowerCase()
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with dashes
      .replace(/[^a-z-]+/g, '') // Remove non-alphanumeric characters (except dashes)
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }
}

const utils = new Utils()

export default utils
