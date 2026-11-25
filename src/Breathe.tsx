import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { breathAt, duration } from './breath';
import { Button, color, type } from './ui';

export default function Breathe({ onBack, onWrite }: { onBack: () => void; onWrite: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const played = useRef(0);
  const started = useRef<number | null>(null);
  const breath = breathAt(elapsed);
  const done = ended || breath.phase === 'done';

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value === true);
    }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; motion.remove(); };
  }, []);

  useEffect(() => {
    if (paused || done) return;

    started.current = performance.now();
    const tick = () => {
      if (started.current === null) return;
      const time = Math.min(duration, played.current + performance.now() - started.current);
      setElapsed(time);
    };
    const timer = setInterval(tick, 50);
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setPaused(true);
    });
    const pauseWhenHidden = () => {
      if (document.hidden) setPaused(true);
    };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', pauseWhenHidden);

    return () => {
      clearInterval(timer);
      listener.remove();
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', pauseWhenHidden);
      if (started.current !== null) {
        played.current = Math.min(duration, played.current + performance.now() - started.current);
        started.current = null;
      }
    };
  }, [paused, done]);

  function replay() {
    played.current = 0;
    setElapsed(0);
    setPaused(false);
    setEnded(false);
  }

  const prompt = done ? '练习结束' : paused ? '已暂停' : breath.phase === 'inhale' ? '轻轻吸气' : '慢慢呼气';

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.top}>
        <Button kind="quiet" label="返回首页" onPress={onBack} />
      </View>
      <View style={styles.center}>
        <View accessible={false} style={styles.ring}>
          <View style={styles.innerRing}>
            <View style={[
              styles.orb,
              { transform: [{ scale: reduceMotion || done ? 0.85 : 0.7 + breath.scale * 0.3 }] },
            ]} />
          </View>
        </View>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={[type.title, styles.centered]}>{prompt}</Text>
        <Text style={[type.body, styles.centered]}>
          {done ? '如果还有什么挂在心上，可以把它记下来。' : '按舒服的节奏呼吸，跟不上也没关系。'}
        </Text>
        {!done && <Text style={styles.time}>{breath.seconds} 秒</Text>}
      </View>
      <View style={styles.actions}>
        {done ? <>
          <Button label="再来一分钟" onPress={replay} />
          <Button kind="secondary" label="记下心事" onPress={onWrite} />
          <Button kind="quiet" label="完成" onPress={onBack} />
        </> : <>
          <Button label={paused ? '继续呼吸' : '暂停'} onPress={() => setPaused(!paused)} />
          <Button kind="quiet" label="结束练习" onPress={() => setEnded(true)} />
        </>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
  top: { alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 22 },
  ring: { width: 224, height: 224, borderRadius: 112, borderWidth: 1, borderColor: '#cadbce', justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  innerRing: { width: 192, height: 192, borderRadius: 96, backgroundColor: '#e0ebe1', justifyContent: 'center', alignItems: 'center' },
  orb: { width: 162, height: 162, borderRadius: 81, backgroundColor: '#6f9a80' },
  centered: { textAlign: 'center' },
  time: { color: color.green, fontVariant: ['tabular-nums'], fontSize: 16 },
  actions: { gap: 8 },
});
