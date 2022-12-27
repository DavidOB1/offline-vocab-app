import React, { useCallback, useState } from "react";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet } from "react-native";
import InfoList from "../components/InfoList";
import { StudyTabsParamList } from "../navigation/StudyPageNavigator";
import { db } from "../utils/database";
import SQLStatements from "../utils/sql-statements";
import AsyncStorage from "@react-native-async-storage/async-storage";

// A type representing the information needed to identify a deck
export type Deck = {
  id: number;
  name: string;
};

// A page which shows information about all the decks in the database
const DeckList = () => {
  const navigation = useNavigation<NavigationProp<StudyTabsParamList>>();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setLoading] = useState(true);

  // Executes a database query each time the page is reloaded so that
  // the most accurate data can be displayed
  useFocusEffect(
    useCallback(() => {
      db.transaction((tx) => {
        tx.executeSql(
          SQLStatements.getListOfDecks,
          [],
          (_, { rows }) => {
            setDecks(rows._array);
            setLoading(false);
          },
          () => {
            setLoading(false);
            Alert.alert("Unable to load decks at this time. Please try again later.");
            return false;
          }
        );
      });
    }, [])
  );

  // A function which deletes a given deck from the database,
  // and if successful, it updates this component's hooks
  const deleteDeck = (deck: Deck) => {
    new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          AsyncStorage.removeItem(deck.id.toString());
          tx.executeSql(SQLStatements.deleteCardsByID, [deck.id]);
          tx.executeSql(SQLStatements.deleteCardSetByID, [deck.id]);
        },
        () => reject("Deletion did not work"),
        () => resolve(undefined)
      );
    })
      .then(() => setDecks(decks.filter((set) => set.id !== deck.id)))
      .catch(() => Alert.alert("An error occurred deleting this set. Please try again later."));
  };

  // A function which ensures that the user intends to delete a given deck before deleting it
  const requestDeletion = (item: Deck) => {
    Alert.alert("Are you sure you want to delete this set?", "", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => deleteDeck(item),
      },
    ]);
  };

  // A function which returns either a spinning wheel or a list of decks, depending on whether the
  // decks are still being loaded or not
  const getList = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="#0000ff"
        />
      );
    } else {
      return (
        <InfoList
          data={decks}
          dataToText={(d) => d.name}
          onPress={(item) => navigation.navigate("Info", item)}
          onDelete={requestDeletion}
        />
      );
    }
  };

  return <SafeAreaView style={styles.container}>{getList()}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DeckList;
