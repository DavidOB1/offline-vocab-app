import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, RouteProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import InfoList from "../components/InfoList";
import { StudyTabsParamList } from "../navigation/StudyPageNavigator";
import { db } from "../utils/database";
import SQLStatements from "../utils/sql-statements";

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

// A page which shows information pertaining to a certain deck
const DeckInfo = ({ route }: { route: RouteProp<StudyTabsParamList, "Info"> }) => {
  const { id } = route.params;
  const [cards, setCards] = useState<CardData[]>([]);
  const [newCardsString, setNewCardsSring] = useState("30");
  const navigation = useNavigation<NavigationProp<StudyTabsParamList>>();

  // Executes a database query each time the page is reloaded so that
  // the most accurate data can be displayed
  useFocusEffect(
    useCallback(() => {
      db.transaction(
        (tx) => {
          AsyncStorage.getItem(id.toString()).then((result) => {
            if (result) {
              setNewCardsSring(result);
            }
          });
          tx.executeSql(SQLStatements.getCards, [id], (_, { rows }) => setCards(rows._array));
        },
        () => Alert.alert("Unable to load the deck at this time. Please try again later.")
      );
    }, [])
  );

  // A function which deletes a given card from the database,
  // and if successful, it updates this component's hooks
  const deleteCard = (card: CardData) => {
    new Promise((resolve, reject) => {
      db.transaction(
        (tx) => tx.executeSql(SQLStatements.deleteSpecificCard, [card.setID, card.num]),
        () => reject("Deletion did not work"),
        () => resolve(undefined)
      );
    })
      .then(() =>
        setCards(cards.filter((term) => term.num !== card.num || term.setID !== card.setID))
      )
      .catch(() => Alert.alert("An error occurred deleting this term. Please try again later."));
  };

  // A function which ensures that the user intends to delete a given card before deleting it
  const requestDeletion = (card: CardData) => {
    Alert.alert("Are you sure you want to delete this term?", "", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => deleteCard(card),
      },
    ]);
  };

  // A function which is executed when the user wants to study the current deck
  const onStudy = () => {
    const newCardNum = Number(newCardsString);
    if (!newCardsString || Number.isNaN(newCardNum)) {
      Alert.alert("Please enter a valid number of new cards to study.");
      return;
    } else {
      AsyncStorage.setItem(id.toString(), newCardsString);
      navigation.navigate("Learn", { cards, studyToday: newCardNum });
    }
  };

  // Returns just a loading wheel if the componenet has not loaded in any cards yet
  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#0000ff"
        />
      </SafeAreaView>
    );
  } else {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View style={styles.studyContainer}>
            <TouchableOpacity
              style={styles.studyNowContainer}
              onPress={onStudy}
            >
              <Text style={styles.studyNow}>Study Now</Text>
            </TouchableOpacity>
            <View style={styles.newCardsContainer}>
              <Text style={styles.newCardsText}>New Cards</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                onChangeText={(input) => setNewCardsSring(input)}
                value={newCardsString}
                maxLength={5}
                returnKeyType="done"
              />
            </View>
          </View>
          <Text style={styles.termText}>
            {cards.length + " term" + (cards.length === 1 ? "" : "s")}
          </Text>
          <InfoList
            data={cards}
            dataToText={(card) => card.term}
            onPress={(item) => navigation.navigate("Term", item)}
            onDelete={requestDeletion}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  termText: {
    padding: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  studyContainer: {
    flexDirection: "row",
    width: "90%",
  },
  textInput: {
    fontSize: 16,
    width: 75,
    height: 30,
    textAlign: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    color: "#333",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  studyNowContainer: {
    width: "70%",
    backgroundColor: "#21c921",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "gray",
  },
  studyNow: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  newCardsContainer: {
    alignItems: "center",
    width: "30%",
  },
  newCardsText: {
    fontWeight: "bold",
  },
});

export default DeckInfo;
