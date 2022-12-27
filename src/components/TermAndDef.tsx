import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { CardData } from "../pages/DeckInfo";

// A component for displaying a term and definition of a card
const TermAndDef = ({ card, showDef }: { card: CardData; showDef: boolean }) => {
  const [allowScroll, setAllowScroll] = useState(true);

  // Returns the definition if the show defintion prop is true, otherwise returns an empty view
  const getDef = () => {
    if (showDef) {
      return (
        <View style={styles.defContainer}>
          <Text style={styles.headerText}>Definition</Text>
          <View style={{ ...styles.textContainer, width: "100%" }}>
            <Text style={styles.innerText}>{card.definition}</Text>
          </View>
        </View>
      );
    } else {
      return <View />;
    }
  };

  return (
    <ScrollView
      onLayout={(event) =>
        setAllowScroll(event.nativeEvent.layout.height > Dimensions.get("window").height - 200)
      }
      contentContainerStyle={styles.container}
      scrollEnabled={allowScroll}
    >
      <Text style={styles.headerText}>Term</Text>
      <View style={styles.textContainer}>
        <Text
          style={styles.innerText}
          onPress={() => {}}
        >
          {card.term}
        </Text>
      </View>
      {getDef()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 15,
  },
  textContainer: {
    width: "80%",
    borderColor: "black",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3eae3",
    borderRadius: 10,
  },
  innerText: {
    padding: 15,
    fontSize: 18,
  },
  defContainer: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TermAndDef;
