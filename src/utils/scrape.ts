import axios from "axios";
import config from "../config";

// Function to fetch the webpage content
export async function fetchWebpageContent() {
  try {
    const response = await axios.get(config.TARGET_SITE);
    return response.data;
  } catch (error) {
    console.error("Error fetching webpage content:", error);
    return null;
  }
}
