import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Button, Image } from "react-native";

export default function Home() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.container}>
                    <Text>Home</Text>
                    {/* <Image source={require('../../assets/bv.png')} /> */}
                    
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});