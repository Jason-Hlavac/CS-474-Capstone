import { StyleSheet, View, Text, Image, TouchableOpacity, Touchable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function Header({ title, isReturnPage }: {title: string, isReturnPage : boolean}){
    const navigation = useNavigation();
    return(<>
        <View style = {styles.headerWrapper}>
            <View style = {styles.logoDiv}>
                <Image style = {styles.smcLogo} source = {require('../assets/images/smc-logo-color.png')}/>
            </View>
            <View style = {styles.titleTextWrapper}>
                <Text style = {styles.titleText}>{title}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('notifications')} style = {styles.touchable}>
                    <Image style = {styles.settingsButton} source = {require('../assets/images/settings-button.png')}></Image>
                </TouchableOpacity>
            </View>
            <View style = {styles.hr}/>
        </View>
    </>)
}

const styles = StyleSheet.create({
    headerWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    
    logoDiv: {
        width: '50%',
        height: '4%',
        alignItems: 'center',
    },

    smcLogo: {
        width: undefined,
        height: '100%',
        aspectRatio: 574/82,
        resizeMode: 'contain',
        marginTop: '1%',
        marginBottom: '1%',
    },

    titleTextWrapper: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },

    titleText: {
        marginTop: '2%',
        fontFamily: 'Bree Serif',
        fontSize: 25,
        color: '#013564',
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
    },

    touchable: {
        height: 20,
        width: 20,
        alignSelf: 'flex-end',
        
    },

    settingsButton: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },

    hr: {
        width: '95%',
        height: 0,
        borderColor: '#605F5F',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    },


});