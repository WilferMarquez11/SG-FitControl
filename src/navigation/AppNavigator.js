import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RecoverScreen from '../screens/auth/RecoverScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import PanelAdminScreen from '../screens/admin/PanelAdminScreen';

import PanelUserScreen from '../screens/user/PanelUserScreen';
import PanelEntrenadorScreen from '../screens/user/PanelEntrenadorScreen';
import RegistrarEntrenadorScreen from '../screens/user/RegistrarEntrenadorScreen';
import RegistrarClientesScreen from '../screens/user/RegistrarClientesScreen';
import RegistrarMembresiasScreen from '../screens/user/RegistrarMembresiasScreen';
import RegistrarPagosScreen from '../screens/user/RegistrarPagosScreen';
import RegistrarAsistenciasScreen from '../screens/user/RegistrarAsistenciasScreen';


import TiposMembresiasScreen from '../screens/user/TiposMembresiasScreen';

import GestionClientesScreen from '../screens/user/GestionClientesScreen';
import GestionMembresiasScreen from '../screens/user/GestionMembresiasScreen';
import GestionPagosScreen from '../screens/user/GestionPagosScreen';
import GestionAsistenciasScreen from '../screens/user/GestionAsistenciasScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Bienvenido"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Bienvenido" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Recuperar" component={RecoverScreen} />
                <Stack.Screen name="Registrar" component={RegisterScreen} />
                <Stack.Screen name="PanelAdmin" component={PanelAdminScreen} />
                <Stack.Screen name="PanelUser" component={PanelUserScreen} />
                <Stack.Screen name="PanelEntrenador" component={PanelEntrenadorScreen} />
                <Stack.Screen name="RegistrarEntrenador" component={RegistrarEntrenadorScreen} />
                <Stack.Screen name="RegistrarClientes" component={RegistrarClientesScreen} />
                <Stack.Screen name="RegistrarMembresias" component={RegistrarMembresiasScreen} />
                <Stack.Screen name="RegistrarPagos" component={RegistrarPagosScreen} />
                <Stack.Screen name="RegistrarAsistencias" component={RegistrarAsistenciasScreen} />
                <Stack.Screen name="GestionClientes" component={GestionClientesScreen} />
                <Stack.Screen name="GestionMembresias" component={GestionMembresiasScreen} />
                <Stack.Screen name="GestionPagos" component={GestionPagosScreen} />
                <Stack.Screen name="GestionAsistencias" component={GestionAsistenciasScreen} />
                <Stack.Screen name="TiposMembresias" component={TiposMembresiasScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}