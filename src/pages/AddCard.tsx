import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native";
import { db } from "../utils/database";
import SQLStatements from "../utils/sql-statements";
import { StudyTabsParamList } from "../utils/types";

const AddCard = ({ route }: { route: RouteProp<StudyTabsParamList, "Add"> }) => {
  const { id } = route.params;
  const [newTerm, setNewTerm] = useState("");
  const [newDef, setNewDef] = useState("");
  const [isLoading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<StudyTabsParamList>>();

  const addNewCard = () => {
    if (!newTerm) {
      Alert.alert("Please enter a valid term.");
      return;
    }
    if (!newDef) {
      Alert.alert("Please enter a valid definition");
      return;
    }
    setLoading(true);
    db.transaction(
      (tx) => {
        tx.executeSql(SQLStatements.maxNumInDeck, [id], (tx, { rows }) => {
          const num = rows._array[0].maxNum;
          if (typeof num !== "number") {
            throw new Error("Unable to get max number for deck");
          }
          tx.executeSql(
            SQLStatements.cardInsert,
            [id, num + 1, newTerm, newDef, null, null, null, null],
            () => {
              setLoading(false);
              navigation.navigate("Info", { id });
            }
          );
        });
      },
      () => {
        setLoading(false);
        Alert.alert("An error has occurred. Please try again later.");
      }
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <TextInput
          style={{ ...styles.textInput, height: 75 }}
          multiline={true}
          value={newTerm}
          onChangeText={(text) => setNewTerm(text)}
          placeholder="Enter new term here..."
        />
        <TextInput
          style={{ ...styles.textInput, height: 125 }}
          multiline={true}
          value={newDef}
          onChangeText={(text) => setNewDef(text)}
          placeholder="Enter new definition here..."
        />
        <TouchableOpacity
          onPress={addNewCard}
          style={styles.submitContainer}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
        {isLoading && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    top: 50,
  },
  textInput: {
    width: "70%",
    margin: 25,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 16,
    color: "#333",
    borderRadius: 10,
    textAlignVertical: "top",
    backgroundColor: "#f5f5f5",
  },
  submitContainer: {
    width: "70%",
    margin: 35,
    backgroundColor: "#4162da",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  submitText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
    padding: 10,
  },
});

export default AddCard;
