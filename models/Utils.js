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

  GetTimeElapsed(dateString) {
    const now = new Date(); // Current date and time
    const pastDate = new Date(dateString); // Given date
  
    // Check if the input date is valid
    if (isNaN(pastDate.getTime())) {
      throw new Error('Invalid date string');
    }
  
    // Calculate the difference in milliseconds
    const timeDiff = now - pastDate;
  
    // Convert milliseconds to hours
    const hoursDiff = timeDiff / (1000 * 60 * 60);
  
    // If less than 24 hours, return in hours (rounded up)
    if (hoursDiff < 24) {
      return `${Math.ceil(hoursDiff)} hours ago`;
    }
  
    // Otherwise, return in days (rounded up)
    const daysDiff = hoursDiff / 24;
    return `${Math.ceil(daysDiff)} days ago`;
  }
}

const utils = new Utils()

export default utils
