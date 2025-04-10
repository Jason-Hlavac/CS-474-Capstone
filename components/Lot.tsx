//
import { StyleSheet, View, Text } from "react-native";
import { ComponentText, LotTitle } from "./ComponentText";

//takes in a name, amount of spaces, availability
let title = "Main Lot";
let parkingSpaces = 0;
// export function lotTitle({title}: {title:String},){
//     return(<>
//     <View></View>
//     </>
//     )
// }
let total_parking = 150;
let spots_taken = 20;
let remaining_parking = total_parking - spots_taken;

export function NewLot() {
  return (
    <View style={styles.lotContainer}>
      {/*Use component text specifiically for this part; email new files to self/maybe send what you got on github*/}
      <LotTitle displayTitle={"Main Lot"}></LotTitle>
      <LotTitle displayTitle={remaining_parking.toString()}></LotTitle>
    </View>
  );
}

//stylesheet for chunks
const styles = StyleSheet.create({
  lotContainer: {
    margin: "3%",
    alignSelf: "flex-start",
    justifyContent: "space-around",
    height: "20%",
    width: "90%",
    backgroundColor: "#143257",
    borderRadius: 15,
  },
});
