import { Linking } from 'react-native';

const SAFE_SCHEMES = ['http:', 'https:'];

/** http / https のみ許可。javascript: や file: スキームを弾く */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return SAFE_SCHEMES.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** 安全な URL のみブラウザで開く */
export async function openSafeUrl(url: string): Promise<void> {
  if (!isSafeUrl(url)) return;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) await Linking.openURL(url);
}
