import { openDatabase } from "expo-sqlite";
import { QuizletCard } from "./quizlet-scraper";
import SQLStatements from "./sql-statements";

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
// a new set with the given name
export const addCardSet = async ({ cards, setName }: { cards: QuizletCard[]; setName: string }) => {
  const newID: number = await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        SQLStatements.getHighestID,
        [],
        (_, { rows }) => {
          const id = rows._array[0].maxID + 1;
          if (typeof id !== "number") {
            reject("Undefined ID");
          } else {
            resolve(id);
          }
        },
        (error) => {
          reject(error);
          return false;
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
};
