import { RouteProp } from "@react-navigation/native";
import React from "react";
import { SafeAreaView } from "react-native";
import TermAndDef from "../components/TermAndDef";
import { StudyTabsParamList } from "../navigation/StudyPageNavigator";

// A page which, when navigated to, displays information about a given card
const CardInfo = ({ route }: { route: RouteProp<StudyTabsParamList, "Term"> }) => {
  const card = route.params;

  return (
    <SafeAreaView>
      <TermAndDef
        card={card}
        showDef={true}
      />
    </SafeAreaView>
  );
};

export default CardInfo;
