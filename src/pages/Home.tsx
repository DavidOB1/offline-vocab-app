import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// The page of the home screen of the application
const Home = () => {
  const [greeting, setGreeting] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [notesText, setNotesText] = useState("");

  // On loading the page, the appropriate greeting and the previously typed notes, if any exist,
  // are loaded and displayed on the page
  useEffect(() => {
    AsyncStorage.getItem("notesText").then((result) => {
      if (result) {
        setNotesText(result);
      }
    });
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning!");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon!");
    } else {
      setGreeting("Good evening!");
    }
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.greetingText}>{greeting}</Text>
        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <Text style={{ ...styles.text, fontWeight: "bold" }}>Today's Notes</Text>
            <View style={styles.readOnlyBox}>
              <Text style={{ ...styles.text, fontSize: 14 }}>Read Only</Text>
              <Switch
                onValueChange={() => setReadOnly(!readOnly)}
                value={readOnly}
                trackColor={{ true: "#007AFF" }}
              />
            </View>
          </View>
          <TextInput
            editable={!readOnly}
            style={{ ...styles.textInput, backgroundColor: readOnly ? "#D4D4D4" : "#f5f5f5" }}
            multiline={true}
            placeholder={readOnly ? "" : "Type notes here..."}
            value={notesText}
            onChangeText={(text) => setNotesText(text)}
            onEndEditing={() => AsyncStorage.setItem("notesText", notesText)}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    top: 100,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 100,
  },
  notesContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "95%",
  },
  readOnlyBox: {
    justifyContent: "space-between",
    alignItems: "center",
    width: "25%",
  },
  textInput: {
    height: 250,
    width: "100%",
    margin: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
    color: "#333",
    borderRadius: 10,
    textAlignVertical: "top",
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default Home;
