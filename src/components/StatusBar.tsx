import React from "react";
import { View, StyleSheet, Text } from "react-native";

// A component representing a certain degree of progress
const StatusBar = ({ numerator, denominator }: { numerator: number; denominator: number }) => {
  const percent = denominator === 0 ? 0 : 100 * Math.min(1, Math.abs(numerator / denominator));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{`${numerator} / ${denominator} Remaining`}</Text>
      <View style={styles.outside}>
        <View style={{ ...styles.bar, width: `${percent}%` }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  bar: {
    height: "100%",
    backgroundColor: "#21c921",
    borderRadius: 5,
    padding: 5,
  },
  text: {
    textAlign: "center",
    padding: 2,
  },
  outside: {
    backgroundColor: "#e3e3df",
    width: "100%",
    borderRadius: 5,
  },
});

export default StatusBar;
