import { openDatabase } from "expo-sqlite";
import SQLStatements from "./sql-statements";
import { Deck, QuizletCard } from "./types";

// Opens/initializes the database and exports it for other files to use
export const db = openDatabase("study-cards.db");
db.transaction((tx) => {
  tx.executeSql(SQLStatements.createCardSetTable);
  tx.executeSql(SQLStatements.createCardTable);
});

// Turns a QuizletCard into an array representing its new data as per the local database
const quizletCardToSQLArray = (card: QuizletCard, id: number) => {
  return [id, card.num, card.term, card.definition, null, null, null, null];
};

// An asyncronous function which adds an array of QuizletCards into the local database under
// a new set with the given name, and returns a Deck object with information about the new deck
export const addCardSet = async ({
  cards,
  setName,
}: {
  cards: QuizletCard[];
  setName: string;
}): Promise<Deck> => {
  const newID: number = await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        SQLStatements.getHighestID,
        [],
        (_, { rows }) => {
          const id = rows._array[0].maxID;
          if (typeof id !== "number") {
            reject("Undefined ID");
          } else {
            resolve(id + 1);
          }
        },
        (error) => {
          reject(error);
          return true;
        }
      );
    });
  });

  await new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(SQLStatements.cardSetInsert, [newID, setName]);
        for (const card of cards) {
          tx.executeSql(SQLStatements.cardInsert, quizletCardToSQLArray(card, newID));
        }
      },
      (error) => reject(error),
      () => resolve(undefined)
    );
  });

  return { id: newID, name: setName };
};
