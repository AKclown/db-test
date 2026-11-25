import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Breathe from './src/Breathe';
import Notes from './src/Notes';
import { Button, color, type } from './src/ui';

type Screen = 'home' | 'breathe' | 'notes' | 'write';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  useEffect(() => {
    if (screen !== 'breathe') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen('home');
      return true;
    });
    return () => listener.remove();
  }, [screen]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.background}>
        <View style={styles.frame}>
          {screen === 'home' && (
            <ScrollView contentContainerStyle={styles.home}>
              <Text style={type.brand}>Relex</Text>
              <View style={styles.hero}>
                <View style={styles.halo} accessible={false}>
                  <View style={styles.haloInner}><View style={styles.core} /></View>
                </View>
                <Text accessibilityRole="header" style={[type.title, styles.centered]}>先停一小会儿</Text>
                <Text style={[type.body, styles.centered]}>给自己一分钟，或者把挂在心上的事写下来。</Text>
              </View>
              <View style={styles.actions}>
                <Button label="开始呼吸 · 1 分钟" onPress={() => setScreen('breathe')} />
                <Button kind="secondary" label="记下心事" onPress={() => setScreen('write')} />
                <Button kind="quiet" label="我的心事" onPress={() => setScreen('notes')} />
              </View>
            </ScrollView>
          )}
          {screen === 'breathe' && <Breathe onBack={() => setScreen('home')} onWrite={() => setScreen('write')} />}
          {(screen === 'notes' || screen === 'write') && (
            <Notes startWriting={screen === 'write'} onBack={() => setScreen('home')} />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: color.paper },
  frame: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
  home: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 24 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 32 },
  halo: { width: 198, height: 198, borderRadius: 99, backgroundColor: '#e6eee4', borderColor: '#d8e5d9', borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  haloInner: { width: 154, height: 154, borderRadius: 77, backgroundColor: '#c9decd', alignItems: 'center', justifyContent: 'center' },
  core: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#6f9a80' },
  centered: { textAlign: 'center' },
  actions: { gap: 8 },
});
