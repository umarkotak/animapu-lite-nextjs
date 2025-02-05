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

  GetTimeElapsed(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const elapsedMilliseconds = now - past;
  
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
  
    if (elapsedSeconds < 60) {
      return `${elapsedSeconds} sec${elapsedSeconds !== 1 ? 's' : ''} ago`;
    } else if (elapsedMinutes < 60) {
      return `${elapsedMinutes} min${elapsedMinutes !== 1 ? 's' : ''} ago`;
    } else if (elapsedHours < 24) {
      return `${elapsedHours} hr${elapsedHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${Math.floor(elapsedHours/24)} days ago`;
    }
  }
}

const utils = new Utils()

export default utils
