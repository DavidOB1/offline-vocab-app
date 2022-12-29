import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeckList from "../pages/DeckList";
import DeckInfo from "../pages/DeckInfo";
import CardInfo from "../pages/CardInfo";
import StudyDeck from "../pages/StudyDeck";
import AddCard from "../pages/AddCard";
import { StudyTabsParamList } from "../utils/types";

// An enum type for the different names of the tabs
enum StudyTabs {
  DeckList = "Decks",
  DeckInfo = "Info",
  CardInfo = "Term",
  StudyDeck = "Learn",
  AddCard = "Add",
}

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
      <Stack.Screen
        name={StudyTabs.AddCard}
        component={AddCard}
      />
    </Stack.Navigator>
  );
};

export default StudyPageNavigator;
