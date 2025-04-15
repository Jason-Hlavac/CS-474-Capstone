import { StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function Header({ title, isReturnPage }: {title: string, isReturnPage : boolean}){
    const navigation = useNavigation();
    return(<>
        <View style = {styles.headerWrapper}>
            <View style = {styles.logoDiv}>
                <Image style = {styles.smcLogo} source = {require('../assets/images/smc-logo-color.png')}/>
            </View>
            <View style = {styles.titleTextWrapper}>
                <View style = {styles.left}>
                {isReturnPage == true ? <TouchableOpacity onPress={() => navigation.navigate('index')} style = {styles.touchable}>
                        <Image style = {styles.returnButton} source = {require('../assets/images/return-button.png')}></Image>
                    </TouchableOpacity> : null}
                </View>
                <View style = {styles.center}>
                    <Text style = {styles.titleText}>{title}</Text>
                </View>
                <View style = {styles.right}>
                    {isReturnPage == false ? <TouchableOpacity onPress={() => navigation.navigate('notifications')} style = {styles.touchable}>
                        <Image style = {styles.settingsButton} source = {require('../assets/images/settings-button.png')}></Image>
                    </TouchableOpacity> : null}
                </View>
            </View>
            <View style = {styles.hr}/>
        </View>
    </>)
}

const styles = StyleSheet.create({
    headerWrapper: {
        height: '10%',
        width: '100%',
        alignItems: 'center',
    },
    
    logoDiv: {
        width: '50%',
        height: '40%',
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

    left: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    center: {
        width: '70%',
        textAlign: 'center',
        justifyContent: 'center',
    },

    right: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'center',
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
        width: 20,
        height: 20,
        alignSelf: 'center',
    },

    settingsButton: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },

    returnButton: {
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