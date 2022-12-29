// A type representing data of a card from a Quizlet set
export type QuizletCard = {
  num: number;
  term: string;
  definition: string;
};

// A type representing the information needed to identify a deck
export type Deck = {
  id: number;
  name: string;
};

// A type representing data for a card in a deck in the program
export type CardData = {
  setID: number;
  num: number;
  term: string;
  definition: string;
  lastStudied: number | null;
  timeDue: number | null;
  exactTime: number | null;
  firstStudied: number | null;
};

// A type used to define the args passed to the componenets by the study tabs navigator
export type StudyTabsParamList = {
  Decks: undefined;
  Info: {
    id: number;
  };
  Term: CardData;
  Learn: {
    cards: CardData[];
    studyToday: number;
  };
  Add: {
    id: number;
  };
};
