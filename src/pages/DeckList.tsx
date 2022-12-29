import React, { useCallback, useState } from "react";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Platform,
} from "react-native";
import InfoList from "../components/InfoList";
import { addCardSet, db } from "../utils/database";
import SQLStatements from "../utils/sql-statements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { Deck, StudyTabsParamList } from "../utils/types";
import prompt from "react-native-prompt-android";

// A page which shows information about all the decks in the database
const DeckList = () => {
  const navigation = useNavigation<NavigationProp<StudyTabsParamList>>();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setLoading] = useState(true);

  // A function which updates the list of decks by fetching new data from the database
  const updateList = useCallback(() => {
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
  }, []);

  // Executes a database query each time the page is reloaded so that
  // the most accurate data can be displayed
  useFocusEffect(updateList);

  // A function which deletes a given deck from the database,
  // and if successful, it updates this component's hooks
  const deleteDeck = (deck: Deck) => {
    db.transaction(
      (tx) => {
        AsyncStorage.removeItem(deck.id.toString());
        tx.executeSql(SQLStatements.deleteCardsByID, [deck.id]);
        tx.executeSql(SQLStatements.deleteCardSetByID, [deck.id]);
      },
      () => Alert.alert("An error occurred deleting this set. Please try again later."),
      () => setDecks(decks.filter((set) => set.id !== deck.id))
    );
  };

  // A function which ensures that the user intends to delete a given deck before deleting it
  const requestDeletion = (item: Deck) => {
    Alert.alert("Are you sure you want to delete this set?", undefined, [
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

  // A function which creates a new deck based on the name the user inputs
  const newDeck = () => {
    const promptText = "Please enter a name for the new deck.";

    const onInput = (text: string) => {
      if (!text) {
        Alert.alert("Please ensure that a valid name is entered.");
      } else {
        addCardSet({ cards: [], setName: text })
          .then(({ id }) => {
            navigation.navigate("Info", { id });
            updateList();
          })
          .catch(() => Alert.alert("An error has occurred. Please try again later."));
      }
    };

    if (Platform.OS === "ios") {
      Alert.prompt(promptText, undefined, onInput);
    } else {
      prompt(promptText, undefined, [{ text: "Cancel" }, { text: "OK", onPress: onInput }], {
        cancelable: true,
      });
    }
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
        <SafeAreaView>
          <View style={styles.newDeckContainer}>
            <Text style={styles.newDeckText}>
              {decks.length + " Deck" + (decks.length === 1 ? "" : "s")}
            </Text>
            <TouchableOpacity onPress={newDeck}>
              <AntDesign
                name="pluscircle"
                size={28}
                color="#21c921"
              />
            </TouchableOpacity>
          </View>
          <InfoList
            data={decks}
            dataToText={(d) => d.name}
            onPress={(item) => navigation.navigate("Info", { id: item.id })}
            onDelete={requestDeletion}
          />
        </SafeAreaView>
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
  newDeckContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  newDeckText: {
    padding: 10,
    marginLeft: 5,
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default DeckList;
