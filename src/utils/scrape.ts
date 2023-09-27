import axios from "axios";
import config from "../config";
import cheerio from "cheerio";

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

export function findIphone(
  html: string,
  model: string = "ip15promax256gb",
) {
  const $ = cheerio.load(html);
  // Find an element by its CSS selector and get its text content

  // Use the CSS selector to select the <h1> element by its ID
  const h1Element = $("#" + model);

  // Use .next() to get the next sibling, which is the <div> in this case
  const divElement = h1Element.next();

  // Select the <table> element within the <div>
  const tableElement = $(divElement);

  let outputString = "ip15promax256gb\n";

  // Iterate through the rows of the table
  tableElement.find("tr").each((index, rowElement) => {
    // Find the <a> element within the first <th> to get the href attribute
    const linkElement = $(rowElement).find("th");
    const linkText = "\n<b>" + linkElement.text().trim() + "</b>\n";
    // console.log(linkText);
    outputString += linkText;

    // Iterate through the cells (table data) in the current row
    $(rowElement)
      .find("td")
      .each((cellIndex, cellElement) => {
        const phoneColor =
          $(cellElement).children().eq(0).text() + ": "; // Get the first child element
        let phoneDesc = phoneColor;
        const img = $(cellElement).children().eq(1); // Get the second child element
        const imgDesc =
          img
            .attr("src")
            ?.replace(
              "/etc/designs/starhub/brochureware/headlibs/images/",
              "",
            )
            .replace(".png", "") + "\n";
        phoneDesc += imgDesc;
        if (!imgDesc.includes("stock-no")) {
          phoneDesc = "<u>" + phoneDesc + "</u>";
        }
        outputString += phoneDesc;
      });
  });
  return outputString;
  console.log(outputString);
}
