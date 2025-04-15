import { StyleSheet, View, Text } from 'react-native';
import { ComponentText } from './ComponentText';
import { CurrentLevelBars } from './CurrentLevelBars';
import React, { useState } from 'react';

export function CurrentLevel(){
    const [currLevel, setCurrLevel] = useState(5);
    const getText = () => {
        const text = ["No Traffic", "Slight Traffic", "Light Traffic", "Moderate Traffic", "Busy Traffic", "Heavy Traffic", "Very Heavy Traffic", "Extreme Traffic", "Standstill"];
        return(text[currLevel]);
    }
    return(<>
    <View style = {styles.container}>
        <ComponentText displayText = { 'Current Traffic Level' }/>
        <View style = {styles.levelContainer}>
            <CurrentLevelBars currLevel={currLevel} />
            <Text style = {styles.currLevelText}>{getText()}</Text>
        </View>
    </View>
    </>)
}

const styles = StyleSheet.create({
    container: {
        height: '25%',
    },

    levelContainer: {
        margin: '2%',
        backgroundColor: '#D8E5F0',
        height: '60%',
        width: '80%',
        alignSelf: 'center',
        borderRadius: 15,
    },

    currLevelText: {
        marginTop: '2%',
        fontFamily: 'Bree Serif',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
    },
})