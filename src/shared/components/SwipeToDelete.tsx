import { memo, useMemo, useRef, type ReactNode } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
} from 'react-native';
import { createThemedStyles } from '@/core/theme';
import { AppText } from './AppText';

const COMMIT_THRESHOLD = 96;
const DISMISS_DISTANCE = 480;

export interface SwipeToDeleteProps {
  readonly children: ReactNode;
  readonly onDelete: () => void;
  readonly actionLabel?: string;
  readonly accessibilityLabel?: string;
}

function SwipeToDeleteComponent({
  children,
  onDelete,
  actionLabel = 'Remove',
  accessibilityLabel = 'Remove',
}: SwipeToDeleteProps) {
  const styles = useStyles();
  const translateX = useRef(new Animated.Value(0)).current;
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          gesture.dx < -6 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderMove: (_event, gesture) => {
          translateX.setValue(Math.min(0, gesture.dx));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dx < -COMMIT_THRESHOLD) {
            Animated.timing(translateX, {
              toValue: -DISMISS_DISTANCE,
              duration: 160,
              useNativeDriver: true,
            }).start(() => onDeleteRef.current());
            return;
          }
          Animated.spring(translateX, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [translateX],
  );

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'delete') {
      onDeleteRef.current();
    }
  };

  return (
    <View
      accessibilityActions={[{ name: 'delete', label: accessibilityLabel }]}
      onAccessibilityAction={handleAccessibilityAction}
      style={styles.container}>
      <View style={styles.backdrop} pointerEvents="none">
        <AppText variant="label" tone="onPrimary">
          {actionLabel.toUpperCase()}
        </AppText>
      </View>
      <Animated.View
        {...responder.panHandlers}
        style={[styles.foreground, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

export const SwipeToDelete = memo(SwipeToDeleteComponent);

const useStyles = createThemedStyles(theme =>
  StyleSheet.create({
    container: { position: 'relative', overflow: 'hidden' },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.danger,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: theme.spacing.xl,
    },
    foreground: { backgroundColor: theme.colors.background },
  }),
);
