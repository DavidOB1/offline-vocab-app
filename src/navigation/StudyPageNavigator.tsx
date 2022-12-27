import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeckList, { Deck } from "../pages/DeckList";
import DeckInfo, { CardData } from "../pages/DeckInfo";
import CardInfo from "../pages/CardInfo";
import StudyDeck from "../pages/StudyDeck";

// An enum type for the different names of the tabs
enum StudyTabs {
  DeckList = "Decks",
  DeckInfo = "Info",
  CardInfo = "Term",
  StudyDeck = "Learn",
}

// A type used to define the args passed to the componenets by the navigator
export type StudyTabsParamList = {
  Decks: undefined;
  Info: Deck;
  Term: CardData;
  Learn: {
    cards: CardData[];
    studyToday: number;
  };
};

const Stack = createNativeStackNavigator<StudyTabsParamList>();

// The main page of the study tab which allows for navigation to the different pages
// associated with displaying and studying the decks
const StudyPageNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={StudyTabs.DeckList}>
      <Stack.Screen
        name={StudyTabs.DeckList}
        component={DeckList}
      />
      <Stack.Screen
        name={StudyTabs.DeckInfo}
        component={DeckInfo}
      />
      <Stack.Screen
        name={StudyTabs.CardInfo}
        component={CardInfo}
      />
      <Stack.Screen
        name={StudyTabs.StudyDeck}
        component={StudyDeck}
      />
    </Stack.Navigator>
  );
};

export default StudyPageNavigator;
