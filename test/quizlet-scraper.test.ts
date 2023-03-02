import getQuizletCards from "../src/utils/quizlet-scraper";

test("Basic use of getQuizletCards on French vocab", async () => {
  const cards = await getQuizletCards(
    "https://quizlet.com/1763426/french-family-vocab-flash-cards/"
  );
  expect(cards.length).toBe(20);
  cards.forEach((card, i) => expect(card.num).toBe(i));
  expect(cards[0]).toEqual({
    num: 0,
    term: "an aunt",
    definition: "une tante",
  });
  expect(cards[2].term).toEqual("a cousin (f)");
  expect(cards[5].definition).toEqual("un père");
  expect(cards[8].definition).toEqual("une grand-mère");
  expect(cards[14].definition).toEqual("un/e parent/e*");
});

test("Testing for when bad URLs are given", async () => {
  await expect(getQuizletCards("garbage")).rejects.toThrow();
  await expect(getQuizletCards("https://www.google.com/")).rejects.toThrow();
  await expect(getQuizletCards("https://quizlet.com/latest")).rejects.toThrow();
  await expect(
    getQuizletCards("https://quizlet.com/frenchetc")
  ).rejects.toThrow();
  await expect(
    getQuizletCards("https://quizlet.com/1763426/flashcards")
  ).rejects.toThrow();
});

test("Testing a small study set", async () => {
  const cards = await getQuizletCards(
    "https://quizlet.com/45417575/shortest-set-on-quizlet-ever-flash-cards/"
  );
  expect(cards.length).toBe(2);
  expect(cards).toEqual([
    {
      num: 0,
      term: "Minecraft",
      definition:
        "A fame for the PC, and 16,258,862 total registered accounts(last time I checked)",
    },
    {
      num: 1,
      term: "Creeper",
      definition: "The anti-villan of Minecraft",
    },
  ]);
});

test("Testing set with 2,000 terms, images, and Chinese characters", async () => {
  const cards = await getQuizletCards(
    "https://quizlet.com/195110387/hsk-5-flash-cards/"
  );
  expect(cards.length).toBe(2000);
  cards.forEach((card, i) => expect(card.num).toBe(i));
  expect(cards[0]).toEqual({
    num: 0,
    term: "阿姨",
    definition: "maternal aunt",
  });
  expect(cards[1812]).toEqual({
    num: 1812,
    term: "位置",
    definition: "wèi zhì - seat, place, position",
  });
  expect(cards[1892]).toEqual({
    num: 1892,
    term: "行李箱",
    definition: "xíng li xiāng - suitcase",
  });
});

test("Ensuring the scraper works when HTML tags are in the Quizlet set", async () => {
  const cards = await getQuizletCards(
    "https://quizlet.com/6795630/html-flashcards/"
  );
  expect(cards.length).toBe(34);
  expect(cards[0].term).toEqual("<html></html>");
  expect(cards[3].term).toEqual("<body></body>");
  expect(cards[9].term).toEqual("<br>");
  expect(cards[10].term).toEqual("<a></a>");
  expect(cards[30].term).toEqual("<p></p>");
  expect(cards[33].term).toEqual("<table></table>");
  expect(cards[33].definition).toEqual(
    "used to define tables and table cells in a web page"
  );
});

test("Ensuring definitions with multiple lines work", async () => {
  const cards = await getQuizletCards(
    "https://quizlet.com/44962051/java-programming-flash-cards/"
  );
  expect(cards.length).toBe(54);
  expect(cards[14].definition).toEqual("/*** [line for comment] ***/");
  expect(cards[50]).toEqual({
    num: 50,
    term: "Do-While Statement",
    definition:
      "Do-while statements are different from the other iteration statements. Instead of checking the condition, they will first perform the operation and then and then check for the condition.\n" +
      "initialization;\n" +
      "do\n" +
      "{\n" +
      " Statement;\n" +
      " increment/Decrement;\n" +
      "}While(Condition);",
  });
  expect(cards[53]).toEqual({
    num: 53,
    term: "protected access modifiers",
    definition:
      "A protected access modifier has the similar features to that of private access modifiers, except the method or variable in the class can be inherited.\n" +
      "Syntax for Method:\n" +
      "[Access_Modifier] [Returntype] [Method_Name](args0, args1...argsn)\n" +
      "{\n" +
      "...................\n" +
      "}\n" +
      "Syntax for Variable:\n" +
      "[Access_Modifier] [datatype] [variable] = [value];",
  });
});
