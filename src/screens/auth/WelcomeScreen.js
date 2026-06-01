import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { palette } from "../../theme/colors"

export default function WelcomeScreen({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/1LogoPrincipal.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.byText}>By</Text>
        <Text style={styles.companyText}>WO Devs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.blanco,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 300,
  },
  footer: {
    marginBottom: 150,
    alignItems: 'center',
  },
  byText: {
    fontSize: 16,
    color: palette.azulOscuro,
  },
  companyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.azulMedio,
  },
});
