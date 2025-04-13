import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity} from 'react-native';

const dummyData = [{day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}];

export function NotificationScroller(){
    const [notificationData, setNotificationData] = useState(dummyData);
    const rows = [];

    for(let i = 0; i < notificationData.length; i++){
        const isPM = notificationData[i].arrivalTime.hours >= 12;
        const amOrPm = isPM ? 'PM' : 'AM';
        rows.push(<>
            <View style = {styles.row}>
                <View style = {[styles.dayCol, styles.col]}>{notificationData[i]['day']}</View>
                <View style = {[styles.arriveCol, styles.col]}>{String(notificationData[i].arrivalTime.hours%12 || 12).padStart(2, '0') + ":" + String(notificationData[i].arrivalTime.minutes).padStart(2, '0') + " " + amOrPm}</View>
                <View style = {[styles.travelCol, styles.col]}>{notificationData[i]['travelTime'].hours + ':' +notificationData[i]['travelTime'].minutes}</View>
                <View style = {[styles.removeCol, styles.col]}><TouchableOpacity style = {styles.touchable}><Image style = {styles.image} source= {require('@/assets/images/closed.png')}/></TouchableOpacity></View>
                <View style = {styles.paddingCol}></View>
            </View>
            </>)

    }

    return(<>
        <View style = {styles.container}>
            <View style = {styles.header}>
                <View style = {[styles.dayCol, styles.col]}>Day</View>
                <View style = {[styles.arriveCol, styles.col]}>Time Arriving</View>
                <View style = {[styles.travelCol, styles.col]}>Travel Time</View>
                <View style = {[styles.removeCol, styles.col]}>Remove</View>
                <View style = {[styles.paddingCol, styles.col]}></View>
            </View>

            <ScrollView style = {styles.scrollable}>
                {rows}

            </ScrollView>
        </View>
    </>)
}


const styles = StyleSheet.create({
    container: {
        height: '40%',
        marginTop: '2%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    header: {
        backgroundColor: '#D8E5F0',
        width: '100%',
        height: '10%',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '2%',
    },

    row:{
        width: '100%',
        height: '20%',
        display: 'flex',
        flexDirection: 'row',
    },

    scrollable:{
        width: '100%',
        height: '80%',
        backgroundColor: '#D8E5F0',
        display: 'flex',
        flexDirection: 'column',
    },

    col: {
        borderRightColor: 'black',
        borderRightWidth: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        fontFamily: 'Bree Serif',
        fontSize: 14,
        color: '#013564',
        fontWeight: 'bold',
    },

    dayCol: {
        width: '18%',
    },

    arriveCol: {
        width: '30%',
    },

    travelCol: {
        width: '30%',
    },

    removeCol: {
        width: '20%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    paddingCol: {
        width: '5%',
    },

    touchable: {
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        alignItems: 'center',
    },

    image: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
        aspectRatio: 1,
    },

})