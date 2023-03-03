import { RouteProp } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import StatusBar from "../components/StatusBar";
import TermAndDef from "../components/TermAndDef";
import { db } from "../utils/database";
import SQLStatements from "../utils/sql-statements";
import { CardData, StudyTabsParamList } from "../utils/types";

// Compares two cards and returns an appropriate comparison integer in range [-1, 1]
const cardSorter = (card1: CardData, card2: CardData) => {
  if (card1.timeDue && card2.timeDue && card1.timeDue !== card2.timeDue) {
    // If both cards have different non-null due dates, then compare the due dates
    return card1.timeDue - card2.timeDue;
  } else if (card1.exactTime && card2.exactTime) {
    // If both cards have non-null exact review times, then compare those values
    return card1.exactTime - card2.exactTime;
  } else if (card1.exactTime) {
    // If only the first card has a non-null exact review time, consider if it is due yet
    return 1 + -2 * Number(card1.exactTime <= new Date().getTime());
  } else if (card2.exactTime) {
    // If only the second card has a non-null exact review time, consider if it is not due yet
    return 1 + -2 * Number(card2.exactTime > new Date().getTime());
  } else if ((card1.timeDue || card2.timeDue) && card1.timeDue !== card2.timeDue) {
    // If only one of the cards has a non-null time that it's due, then prioritize that card
    return 1 + -2 * Number(card1.timeDue);
  } else {
    // Otherwise, the cards are essentially equal in order.
    // They must be both due on the same day (or both have null values),
    // and neither have an exact time for which they need to be reviewed.
    return 0;
  }
};

// A page where the user can study the cards from a specific deck
const StudyDeck = ({ route }: { route: RouteProp<StudyTabsParamList, "Learn"> }) => {
  const { cards, studyToday } = route.params;

  const [studyCards, setStudyCards] = useState<CardData[]>([]);
  const [defShown, setDefShown] = useState(false);
  const [dbLoading, setDBLoading] = useState(false);
  const reviewAmount = useRef(0);
  const newCardsLeft = useRef(0);
  const todayTime = useMemo(() => new Date().setHours(0, 0, 0, 0), []);

  // A function used to sort the initial list by prioritizing cards due today, then cards
  // with no due date, then in last, cards due after today
  const initialSorter = useCallback(
    (card1: CardData, card2: CardData) => {
      if (card1.timeDue && card2.timeDue) {
        // Pick the card with the lowest time due
        return card1.timeDue - card2.timeDue;
      } else if (card1.timeDue) {
        // Prioritize this card if it is due today or earlier
        return 1 + -2 * Number(card1.timeDue <= todayTime);
      } else if (card2.timeDue) {
        // Prioritize this card if the other one is due after today
        return 1 + -2 * Number(card2.timeDue > todayTime);
      } else {
        // Both cards have null due dates, so they are both equal in order
        return 0;
      }
    },
    [todayTime]
  );

  // A function which determines if a given card was already completed today
  const completedToday = useCallback(
    (card: CardData) => {
      return card.lastStudied === todayTime && card.timeDue && card.timeDue > todayTime;
    },
    [todayTime]
  );

  // A function which determines if a given card is due for review today
  const dueForReview = useCallback(
    (card: CardData) => {
      return (
        card.firstStudied !== todayTime &&
        ((card.timeDue && card.timeDue <= todayTime) || card.lastStudied == todayTime)
      );
    },
    [todayTime]
  );

  // A function which determines if a given card has never been seen or was first seen today
  const newCard = useCallback(
    (card: CardData) => !card.firstStudied || card.firstStudied === todayTime,
    [todayTime]
  );

  // Initializes the list of cards to be studied once the component is initially loaded
  useEffect(() => {
    const alrCompleted = cards.filter(completedToday).length;
    reviewAmount.current = cards.filter(dueForReview).length;
    newCardsLeft.current = cards.filter(newCard).length;
    const newAmount = Math.max(
      0,
      Math.min(studyToday, newCardsLeft.current) + reviewAmount.current - alrCompleted
    );
    const newCards = [...cards]
      // Ensures that cards that need to be studied today are brought to the front of the deck
      .sort(initialSorter)
      // Cuts the list to include only the amount of cards that need to be studied
      .slice(0, newAmount)
      // Shuffles the cards
      .sort(() => Math.random() - 0.5)
      // Sorts the card by the actual order they should be studied in
      // (tied cards maintain the previous shuffle)
      .sort(cardSorter);
    setStudyCards(newCards);
  }, []);

  // Given the level of difficulty (0 is lowest, 4 is highest), determines when to next
  // make the card due for studying, and updates the data and the database accordingly
  const onStudied = useCallback(
    (level: number) => {
      // Creates default values for the new entry
      const curCard = studyCards[0];
      let nextDate = new Date();
      nextDate.setHours(0, 0, 0, 0);
      let exactTime: number | null = null;
      let lastStudied = todayTime;

      if (level === 0) {
        // If way too easy, don't show again for another year
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else if (level === 1) {
        // If easy, show again in a few days
        let newGap: number;
        if (curCard.exactTime) {
          // Show again tomorrow if this card was previously difficult
          newGap = 1;
        } else if (curCard.lastStudied) {
          // Show again in twice as many days as it was last separated by
          newGap = 2 * Math.round((curCard.lastStudied - todayTime) / 86400000);
        } else {
          // If being seen for the first time, show again in 4 days
          newGap = 4;
        }
        nextDate.setDate(nextDate.getDate() + newGap);
      } else if (level === 2) {
        if (curCard.exactTime) {
          // If okay but was previously difficult, show again in 20 minutes
          exactTime = new Date().getTime() + 1200000;
          if (curCard.lastStudied) {
            lastStudied = curCard.lastStudied;
          }
        } else {
          // If okay and was not previously difficult, show again tomorrow
          nextDate.setDate(nextDate.getDate() + 1);
        }
      } else {
        // If difficult, show again in 5 minutes
        exactTime = new Date().getTime() + 300000;
        if (curCard.lastStudied) {
          lastStudied = curCard.lastStudied;
        }
      }

      // If this card is being seen for the first time, update its field
      if (!curCard.firstStudied) {
        curCard.firstStudied = todayTime;
      }

      // Update the other fields with the previously accumulated variables
      curCard.timeDue = nextDate.getTime();
      curCard.exactTime = exactTime;
      curCard.lastStudied = lastStudied;

      // Update the database, and if successful, proceed to update the component state
      setDBLoading(true);
      db.transaction(
        (tx) => {
          tx.executeSql(SQLStatements.updateCard, [
            curCard.lastStudied,
            curCard.timeDue,
            curCard.exactTime,
            curCard.firstStudied,
            curCard.setID,
            curCard.num,
          ]);
        },
        () => {
          Alert.alert("An error has occurred. Please try again later.");
          setDBLoading(false);
        },
        () => {
          if (nextDate.getTime() === todayTime) {
            setStudyCards(studyCards.sort(cardSorter));
          } else {
            setStudyCards(studyCards.filter((item) => item !== curCard));
          }

          setDefShown(false);
          setDBLoading(false);
        }
      );
    },
    [todayTime, studyCards]
  );

  // A function which returns the options at the bottom of the screen based on
  // whether the use should be pressing to see the answer or if they should be
  // rating the difficulty of the term
  const getBottomOptions = () => {
    if (defShown) {
      return (
        <View style={{ marginBottom: 15 }}>
          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={{ ...styles.difficultyButton, backgroundColor: "#b71cde" }}
              onPress={() => onStudied(0)}
            >
              <Text style={styles.difficultyText}>Way Too Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ ...styles.difficultyButton, backgroundColor: "#3bec1b" }}
              onPress={() => onStudied(1)}
            >
              <Text style={styles.difficultyText}>Pretty Easy</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={{ ...styles.difficultyButton, backgroundColor: "#ffd700" }}
              onPress={() => onStudied(2)}
            >
              <Text style={styles.difficultyText}>Alright</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ ...styles.difficultyButton, backgroundColor: "red" }}
              onPress={() => onStudied(3)}
            >
              <Text style={styles.difficultyText}>Difficult</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={{ ...styles.difficultyButton, ...styles.showAnswerButtonExtension }}
          onPress={() => setDefShown(true)}
          disabled={dbLoading}
        >
          <Text style={styles.showAnswer}>Show Answer</Text>
        </TouchableOpacity>
      );
    }
  };

  // If there are no cards left to study, show a congrats message,
  // otherwise, show the terms to study
  if (studyCards.length === 0) {
    return (
      <SafeAreaView style={{ ...styles.container, marginTop: 100 }}>
        <Text style={styles.congrats}>Congrats! 🎉</Text>
        <Text style={styles.congrats}>You finished all the cards for today!</Text>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView>
          <TermAndDef
            card={studyCards[0]}
            showDef={defShown}
          />
        </ScrollView>
        <View style={styles.container}>
          <View style={styles.bottomOptions}>
            {getBottomOptions()}
            <StatusBar
              numerator={studyCards.length}
              denominator={Math.min(studyToday, newCardsLeft.current) + reviewAmount.current}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  congrats: {
    padding: 20,
    fontSize: 36,
    textAlign: "center",
    fontWeight: "bold",
    color: "green",
  },
  bottomOptions: {
    padding: 10,
    alignItems: "center",
    width: "90%",
    marginBottom: 30,
  },
  difficultyButton: {
    backgroundColor: "#e3e3df",
    margin: 5,
    padding: 10,
    borderRadius: 10,
    width: "50%",
  },
  showAnswerButtonExtension: {
    width: "70%",
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  showAnswer: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  difficultyContainer: {
    flexDirection: "row",
    width: "95%",
  },
  difficultyText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});

export default StudyDeck;
