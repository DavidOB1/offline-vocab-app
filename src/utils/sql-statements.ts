// SQL statements used by the program to access and edit the database
const SQLStatements = {
  createCardSetTable: `CREATE TABLE IF NOT EXISTS CardSets(
        SetID int,
        Name text,
        PRIMARY KEY (SetID)
    );`,
  createCardTable: `CREATE TABLE IF NOT EXISTS Cards(
        SetID int,
        Num int,
        Term text NOT NULL,
        Definition text NOT NULL,
        LastStudied timestamp,
        TimeDue timestamp,
        ExactTime timestamp,
        FirstStudied timestamp,
        PRIMARY KEY (SetID, Num),
        FOREIGN KEY (SetID) REFERENCES CardSets(SetID)
    );`,
  cardInsert:
    "INSERT INTO Cards(SetID, Num, Term, Definition, LastStudied, TimeDue, ExactTime, FirstStudied) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
  cardSetInsert: "INSERT INTO CardSets(SetID, Name) VALUES (?, ?);",
  getCards: `SELECT SetID setID, Num num, Term term, Definition definition, LastStudied lastStudied, TimeDue timeDue, ExactTime exactTime, FirstStudied firstStudied
        FROM Cards 
        WHERE SetID = ? 
        ORDER BY Num`,
  getListOfDecks: "SELECT SetID id, Name name FROM CardSets ORDER BY id",
  getHighestID: "SELECT COALESCE(max(SetID), 0) maxID FROM CardSets",
  deleteCardsByID: "DELETE FROM Cards WHERE SetID = ?",
  deleteCardSetByID: "DELETE FROM CardSets WHERE SetID = ?",
  deleteSpecificCard: "DELETE FROM Cards WHERE SetID = ? AND Num = ?",
  updateCard: `UPDATE Cards
    SET LastStudied = ?,
        TimeDue = ?,
        ExactTime = ?,
        FirstStudied = ?
    WHERE SetID = ?
      and Num = ?`,
};

export default SQLStatements;
