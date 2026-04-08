import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput style={[style, { lineHeight: 17 }]} {...props} />;
}
