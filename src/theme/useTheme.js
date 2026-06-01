import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './colors';

export function useTheme() {
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const cargarTema = async () => {
      try {
        const guardado = await AsyncStorage.getItem('modoOscuro');
        if (guardado !== null) setModoOscuro(JSON.parse(guardado));
      } catch (e) {
        console.error('Error cargando tema:', e);
      }
    };
    cargarTema();
  }, []);

  const toggleTema = async () => {
    try {
      const nuevo = !modoOscuro;
      setModoOscuro(nuevo);
      await AsyncStorage.setItem('modoOscuro', JSON.stringify(nuevo));
    } catch (e) {
      console.error('Error guardando tema:', e);
    }
  };

  const tema = modoOscuro ? darkTheme : lightTheme;

  return { tema, modoOscuro, toggleTema };
}
