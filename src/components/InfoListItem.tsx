import { EvilIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";

// A component for each individual item in an InfoList
const InfoListItem = <T extends {}>({
  data,
  onPress,
  onDelete,
  dataToText,
}: {
  data: T;
  onPress: (value: T) => void;
  onDelete: (value: T) => void;
  dataToText: (value: T) => string;
}) => {
  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.deck}
        onPress={() => onPress(data)}
      >
        <Text
          style={styles.deckText}
          numberOfLines={1}
        >
          {dataToText(data)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(data)}>
        <EvilIcons
          name="trash"
          size={36}
          color="red"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deck: {
    backgroundColor: "#e3e3df",
    margin: 5,
    padding: 10,
    borderRadius: 10,
    width: "85%",
  },
  deckText: {
    fontSize: 24,
  },
});

export default InfoListItem;
