import { StyleSheet, View, Text } from "react-native";

export function ComponentText({ displayText }: { displayText: String }) {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>{displayText}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  text: {
    marginTop: "2%",
    fontFamily: "Bree Serif",
    fontSize: 20,
    color: "#013564",
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
  },
});

export function LotTitle({ displayTitle }: { displayTitle: String }) {
  return (
    <>
      <View style={ParkingStyles.container}>
        <Text style={ParkingStyles.text}>{displayTitle}</Text>
      </View>
    </>
  );
}

const ParkingStyles = StyleSheet.create({
  container: {
    width: "100%",
  },

  text: {
    // marginTop: "2%",
    // fontFamily: "Bree Serif",
    // margin: "2%",
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "right",
    alignSelf: "flex-start",
  },
});
