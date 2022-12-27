import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import Home from "../pages/Home";
import ImportPage from "../pages/ImportPage";
import StudyPageNavigator from "./StudyPageNavigator";

// The color of the option on the bottom nav bar which is currently selected
const focusColor = "#00ace6";

// An enum type for the different names of the tabs
enum TabNames {
  Study = "Study",
  Home = "Home",
  Import = "Import from Quizlet",
}

// Returns the icon that matches the given tab name
const tabNameToIcon = ({ tabName, color }: { tabName: string; color: string }) => {
  if (tabName === TabNames.Study) {
    return (
      <FontAwesome
        name="book"
        size={24}
        color={color}
      />
    );
  } else if (tabName === TabNames.Home) {
    return (
      <Entypo
        name="home"
        size={24}
        color={color}
      />
    );
  } else if (tabName === TabNames.Import) {
    return (
      <Entypo
        name="download"
        size={24}
        color={color}
      />
    );
  } else {
    return (
      <AntDesign
        name="question"
        size={24}
        color={color}
      />
    );
  }
};

const Tab = createBottomTabNavigator();

// The main navigation page which allows for navigating to pages using the bottom tab
const MainContainer = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={TabNames.Home}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) =>
            tabNameToIcon({ tabName: route.name, color: focused ? focusColor : "black" }),
          tabBarActiveTintColor: focusColor,
          tabBarLabelStyle: {
            fontWeight: "bold",
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name={TabNames.Study}
          children={() => <StudyPageNavigator />}
        />
        <Tab.Screen
          name={TabNames.Home}
          component={Home}
        />
        <Tab.Screen
          name={TabNames.Import}
          children={() => <ImportPage />}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default MainContainer;
