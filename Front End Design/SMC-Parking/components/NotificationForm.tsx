import React, { useState } from 'react';
import { StyleSheet, View, Button, Text} from 'react-native';
import {Picker} from '@react-native-picker/picker';

export function NotificationForm(){
    const [selectedDay, setSelectedDay] = useState('mon');
    const [arrivalTime, setArrivalTime] = useState();
    const [departTime, setDepartTime] = useState();

    function processForm(){
        console.log(selectedDay)
    }

    return(<>
        <View style = {styles.container}>
            <Picker selectedValue={selectedDay} onValueChange={(itemValue) => setSelectedDay(itemValue)}>
                <Picker.Item label = 'Monday' value = 'mon'></Picker.Item>
                <Picker.Item label = 'Tuesday' value = 'tues'></Picker.Item>
                <Picker.Item label = 'Wednesday' value = 'wed'></Picker.Item>
                <Picker.Item label = 'Thursday' value = 'thu'></Picker.Item>
                <Picker.Item label = 'Friday' value = 'fri'></Picker.Item>
                <Picker.Item label = 'Saturday' value = 'sat'></Picker.Item>
                <Picker.Item label = 'Sunday' value = 'sun'></Picker.Item>
            </Picker>
            <View style = {styles.break}/>
            <Text style = {styles.formText}>Arrival Time</Text>
            
            <View style = {styles.break}/>
            <Button title = "Add Time" color={'#D82732'} onPress = {processForm}/>
        </View>
        <View style = {styles.hr}/>
    </>)
}

const styles = StyleSheet.create({
    container: {
        height: '40%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    hr: {
        width: '60%',
        height: 0,
        borderColor: '#605F5F',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        alignSelf: "center",
    },

    break:{
        flexBasis: '100%',
        height: 0,
    },

    formText: {
        fontFamily: 'Bree Serif',
        fontSize: 14,
        color: '#013564',
        fontWeight: 'bold',
    }
});