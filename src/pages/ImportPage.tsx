import { Entypo } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { addCardSet } from "../utils/database";
import getQuizletCards, { QuizletCard } from "../utils/quizlet-scraper";

// The page which allows the user to import decks from Quizlet
const ImportPage = () => {
  const [quizletURL, setQuizletURL] = useState("");
  const [setName, setSetName] = useState("");

  // Loading State: 0 -> nothing, 1 -> loading, 2 -> success
  const [loadingState, setLoadingState] = useState(0);

  // A function which uses the current state of the componenet and attempts to
  // download and store the appropriate Quizlet deck
  const importQuizletDeck = () => {
    if (quizletURL === "") {
      Alert.alert("Please enter a Quizlet URL.");
      setLoadingState(0);
      return;
    }
    if (setName === "") {
      Alert.alert("Please enter the name of the new study set.");
      setLoadingState(0);
      return;
    }

    // If given a non-empty URL and name, attempts to fetch the data from the website
    setLoadingState(1);
    getQuizletCards(quizletURL)
      .then((cards: QuizletCard[]) => {
        addCardSet({ cards, setName })
          .then(() => {
            setQuizletURL("");
            setSetName("");
            setLoadingState(2);
            setTimeout(() => setLoadingState(0), 2000);
          })
          .catch(() => {
            setLoadingState(0);
            Alert.alert("An error occurred constructing the new set. Please try again later.");
          });
      })
      .catch(() => {
        setLoadingState(0);
        Alert.alert(
          "An error has occurred trying to download the set. Please ensure your URL is correct and try again later."
        );
      });
  };

  // A function that returns the appropriate status component based on the current status
  // of fetching the Quizlet deck
  const getStatusComp = (num: number) => {
    if (num === 1) {
      return (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingWheel}
        />
      );
    } else if (num === 2) {
      return <Text style={styles.successText}>Success!</Text>;
    } else {
      return <View />;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <TextInput
          placeholder="Paste Quizlet URL link..."
          onChangeText={(newURL: string) => setQuizletURL(newURL)}
          value={quizletURL}
          style={styles.textInput}
          returnKeyType="done"
        />
        <TextInput
          placeholder="Name of new study set..."
          onChangeText={(newName: string) => setSetName(newName)}
          value={setName}
          style={styles.textInput}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={importQuizletDeck}
          disabled={loadingState === 1}
        >
          <Entypo
            name="download"
            size={24}
            color="white"
          />
          <Text style={styles.buttonText}> Import Cards from Quizlet</Text>
        </TouchableOpacity>
        {getStatusComp(loadingState)}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    top: 100,
  },
  textInput: {
    height: 50,
    width: 250,
    margin: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#124bf0",
    padding: 15,
    margin: 20,
    borderColor: "#e7c014",
    borderWidth: 4,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
  loadingWheel: {
    margin: 10,
  },
  successText: {
    fontWeight: "bold",
    color: "green",
    margin: 10,
    fontSize: 24,
  },
});

export default ImportPage;
