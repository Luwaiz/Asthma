// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'plus.circle.fill': 'add-circle',
  'pill.fill': 'medication',
  'sun.dust': 'air',
  'pawprint': 'pets',
  'pollen': 'local-florist',
  'smoke': 'smoking-rooms',
  'cloud': 'cloud',
  'calendar': 'event',
  'calendar.fill': 'calendar-month',
  'sparkles': 'auto-awesome',
  'person.fill': 'person',
  'phone.fill': 'phone',
  'plus': 'add',
  'bell.fill': 'notifications',
  'info.circle.fill': 'info',
  'checkmark.circle': 'check-circle-outline',
  'checkmark.circle.fill': 'check-circle',
  'chevron.left': 'chevron-left',
  'minus.circle.fill': 'remove-circle',
  'bookmark': 'bookmark-outline',
  'clock': 'access-time',
  'chart.bar.fill': 'bar-chart',
  'snowflake': 'ac-unit',
  'figure.run': 'directions-run',
  'brain.head.profile': 'psychology',
  'drop.fill': 'water-drop',
  'microbe.fill': 'coronavirus',
  'wind': 'air',
} as any as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
