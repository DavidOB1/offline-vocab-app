import axios from "axios";
import cheerio, { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { QuizletCard } from "./types";
import { decode } from 'he';

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

  // Iterates through each of the visible term-def pairs and adds the pairings to the output array
  $(".SetPageTerm-content").each((i, element) => {
    const term = processText($(element).find(".SetPageTerm-wordText").children());
    const definition = processText($(element).find(".SetPageTerm-definitionText").children());
    cards.push({ num: i, term, definition });
  });

  // If there are more cards that aren't visible, those are found and added to the output too
  $('div[style*="display:none"]').each((i, element) => {
    // The div with the hidden cards will always be the second one
    if (i == 2) {
      // Gets all of the span elements
      const spans = $(element).find("span");

      // There must be an even number, as the structure is
      // <span>term</span><span>definition</span>
      if (spans.length % 2 != 0) {
        throw new Error("Given website does not have the correct structure");
      }

      // For each pair of two span elements, extract the term and definition and make a card
      spans.each((ind, elem) => {
        if (ind % 2 == 0) {
          const current = $(elem);
          const term = processText(current);
          const definition = processText(current.next());
          cards.push({ num: cards.length, term, definition });
        }
      })
    }
  });

  // If no cards were found, then an error is thrown as the website does not
  // have the expected structure
  if (cards.length == 0) {
    throw new Error("Unable to get any cards from the given website");
  }

  return cards;
};

// Process the text from the given Cheerio object and returns the appropriate string
const processText = (data: Cheerio<AnyNode>) => {
  const html = data.html()
  if (html === null) {
    throw new Error("Given website does not have the correct structure");
  }
  return decode(html.replace(/<br>/g, "\n"));
}

export default getQuizletCards;
