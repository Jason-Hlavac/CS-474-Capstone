import { StyleSheet, View, Text } from 'react-native';
import {NewLot} from './Lot'
export function ParkingLots(){
    //need way to add lots
    <View style = {styles.container}></View>
    
    return <View style = {styles.container}>
        <NewLot></NewLot>
    </View>;
}

const styles = StyleSheet.create({
    container:{
        margin: '2%',
        alignSelf: 'flex-end',
        height: '45%',
        width: '45%',
        backgroundColor: '#d8e5f0',
        borderRadius: 15
    }

})