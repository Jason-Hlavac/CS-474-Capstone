import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Text} from 'react-native';

type NotificationType = {
    day: string;
    arrivalTime: { hours: number; minutes: number };
    travelTime: { hours: number; minutes: number };
  };
  
  type StoredData = {
    isNotificationToggled: boolean;
    notificationData: NotificationType[];
  };

export function NotificationScroller({notificationData, setNotificationData}: {notificationData : NotificationType[]; setNotificationData: React.Dispatch<React.SetStateAction<NotificationType[]>>;}){
    const rows = [];

    function removeNotification(index: number) {
        setNotificationData(prevData => prevData.filter((_, i) => i !== index));
    }

    for(let i = 0; i < notificationData.length; i++){
        const isPM = notificationData[i].arrivalTime.hours >= 12;
        const amOrPm = isPM ? 'PM' : 'AM';
        rows.push(
            <View style = {styles.row} key = {i}>
                <View style = {[styles.dayCol, styles.col]}><Text style = {{textTransform: 'capitalize'}}>{notificationData[i]['day']}</Text></View>
                <View style = {[styles.arriveCol, styles.col]}><Text>{String(notificationData[i].arrivalTime.hours%12 || 12).padStart(2, '0') + ":" + String(notificationData[i].arrivalTime.minutes).padStart(2, '0') + " " + amOrPm}</Text></View>
                <View style = {[styles.travelCol, styles.col]}><Text>{notificationData[i]['travelTime'].hours + ':' +notificationData[i]['travelTime'].minutes}</Text></View>
                <View style = {[styles.removeCol, styles.col]}><TouchableOpacity style = {styles.touchable} onPress = {() => removeNotification(i)}><Image style = {styles.image} source= {require('@/assets/images/closed.png')}/></TouchableOpacity></View>
                <View style = {styles.paddingCol}></View>
            </View>
            )

    }

    return(<>
        <View style = {styles.container}>
            <View style = {styles.header}>
                <View style = {[styles.dayCol, styles.col]}><Text>Day</Text></View>
                <View style = {[styles.arriveCol, styles.col]}><Text>Time Arriving</Text></View>
                <View style = {[styles.travelCol, styles.col]}><Text>Travel Time</Text></View>
                <View style = {[styles.removeCol, styles.col]}><Text>Remove</Text></View>
                <View style = {[styles.paddingCol, styles.col]}></View>
            </View>

            <ScrollView style = {styles.scrollable} contentContainerStyle = {{flexGrow: 1}}>
                {rows}

            </ScrollView>
        </View>
    </>)
}


const styles = StyleSheet.create({
    container: {
        height: '45%',
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
        height: 40,
        display: 'flex',
        flexDirection: 'row',
    },

    scrollable:{
        width: '100%',
        height: 300,
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
        width: '20%',
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