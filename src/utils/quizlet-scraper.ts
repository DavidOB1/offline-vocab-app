import axios from "axios";
import cheerio, { CheerioAPI } from "cheerio";
import { QuizletCard } from "./types";

// An asynchronous function which returns an array of QuizletCards corresponding
// to the study set at the given link
const getQuizletCards = async (url: string) => {
  const html = await getPage(url);
  const parser = cheerio.load(html);
  return getCards(parser);
};

// An asynchronous function which returns the contents of the webpage at the given URL
const getPage = async (url: string) => {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Encoding": "*",
    },
  });
  return response.data;
};

// A function which, given a Cheerio object containing data about a Quizlet page,
// returns a non-empty array of QuizletCards corresponding to the cards on that page
const getCards = ($: CheerioAPI) => {
  const cards: QuizletCard[] = [];

  // Iterates through each term-def pair and adds the pairings to the output array
  $(".SetPageTerm-content").each((i, element) => {
    const term = $(element).find(".SetPageTerm-wordText").children().html()?.replace(/<br>/g, "\n");
    const definition = $(element)
      .find(".SetPageTerm-definitionText")
      .children()
      .html()
      ?.replace(/<br>/g, "\n");
    if (term === undefined || definition === undefined) {
      throw new Error("Given website does not have the correct structure");
    }
    cards.push({ num: i, term, definition });
  });

  // If no cards were found, then an error is thrown as the website does not
  // have the expected structure
  if (cards.length == 0) {
    throw new Error("Unable to get any cards from the given website");
  }

  return cards;
};

export default getQuizletCards;
