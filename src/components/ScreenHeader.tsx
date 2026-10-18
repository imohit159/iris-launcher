import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { DIVIDERS, TYPOGRAPHY } from "../design/tokens";

type Props = {
  title: string;
  titleColor: string;
  borderColor?: string;
  onBack?: () => void;
  scrolled?: boolean;
};

export function ScreenHeader({
  title,
  titleColor,
  borderColor = DIVIDERS.subtle,
  onBack,
  scrolled = false,
}: Props) {
  const hasBack = onBack !== undefined;
  const [separatorInset] = useState(() => new Animated.Value(24));

  useEffect(() => {
    const animation = Animated.timing(separatorInset, {
      toValue: scrolled ? 0 : 24,
      duration: 180,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [scrolled, separatorInset]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, hasBack && styles.navigationHeader]}>
        {hasBack ? (
          <View style={[styles.slot, styles.startSlot]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to settings"
              onPress={onBack}
              style={styles.backButton}
            >
              <Text style={[styles.backText, { color: titleColor }]}>‹</Text>
            </Pressable>
          </View>
        ) : null}
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      </View>
      <Animated.View
        style={[
          styles.separator,
          { marginHorizontal: separatorInset, backgroundColor: borderColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  navigationHeader: {
    paddingHorizontal: 0,
  },
  separator: {
    height: 1,
    marginHorizontal: 24,
  },
  title: {
    ...TYPOGRAPHY.screenTitle,
    marginLeft: 8,
  },
  slot: {
    width: 48,
    height: 48,
    justifyContent: "center",
  },
  startSlot: {
    alignItems: "flex-start",
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    ...TYPOGRAPHY.navigationIcon,
  },
});
