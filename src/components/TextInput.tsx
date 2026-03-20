import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput style={[{ lineHeight: 17 }, style]} {...props} />;
}
