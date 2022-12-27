import React from "react";
import { FlatList } from "react-native";
import InfoListItem from "./InfoListItem";

// Component for a list of data in which each entry can be removed
// or pressed to access a further part of it
const InfoList = <T extends {}>({
  data,
  dataToText,
  onDelete,
  onPress,
}: {
  data: T[];
  dataToText: (value: T) => string;
  onDelete: (value: T) => void;
  onPress: (value: T) => void;
}) => {
  return (
    <FlatList
      data={data}
      horizontal={false}
      updateCellsBatchingPeriod={1000}
      maxToRenderPerBatch={50}
      initialNumToRender={25}
      renderItem={({ item }) => (
        <InfoListItem
          data={item}
          onPress={onPress}
          onDelete={onDelete}
          dataToText={dataToText}
        />
      )}
    />
  );
};

export default InfoList;
