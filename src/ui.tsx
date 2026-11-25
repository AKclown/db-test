import { Pressable, StyleSheet, Text } from 'react-native';

export const color = {
  paper: '#f2f5ef',
  ink: '#18362c',
  muted: '#496356',
  line: '#d3ddd3',
  white: '#ffffff',
  green: '#215142',
  soft: '#e3ede3',
  danger: '#8a3834',
};

export function Button({ label, onPress, kind = 'primary', disabled = false }:{
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'quiet' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button, styles[kind], (pressed || disabled) && { opacity: 0.55 },
      ]}
    >
      <Text style={[
        styles.label,
        kind === 'primary' && { color: color.white },
        kind === 'danger' && { color: color.danger },
      ]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 50, justifyContent: 'center', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16 },
  primary: { backgroundColor: color.green },
  secondary: { borderWidth: 1, borderColor: color.line, backgroundColor: color.white },
  quiet: { backgroundColor: 'transparent' },
  danger: { borderWidth: 1, borderColor: '#e4c7c6', backgroundColor: '#fff8f7' },
  label: { fontSize: 16, fontWeight: '600', color: color.ink, textAlign: 'center' },
});

export const type = StyleSheet.create({
  brand: { color: color.green, fontSize: 23, fontWeight: '700', letterSpacing: 0.2 },
  title: { color: color.ink, fontSize: 30, fontWeight: '700' },
  body: { color: color.muted, fontSize: 15, lineHeight: 24 },
});
