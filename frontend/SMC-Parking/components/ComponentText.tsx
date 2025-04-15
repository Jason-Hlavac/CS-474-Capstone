import { StyleSheet, View, Text } from 'react-native';

export function ComponentText({ displayText }: {displayText: String}){
    return(<>
    <View style = {styles.container}>
        <Text style = {styles.text}>{displayText}</Text>
    </View>
    </>)
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },

    text: {
        marginTop: '2%',
        fontFamily: 'Bree Serif',
        fontSize: 20,
        color: '#013564',
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
    },


})