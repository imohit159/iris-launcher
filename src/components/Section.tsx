import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { SPACING, TYPOGRAPHY } from "../design/tokens";
import { Separator } from "./Separator";

type SectionContainerProps = {
  children: ReactNode;
  separator?: boolean;
  /** First content section on a screen has no leading divider. */
  first?: boolean;
  style?: StyleProp<ViewStyle>;
};

type SectionProps = SectionContainerProps & {
  label?: string;
  labelColor?: string;
};

export function SectionContainer({
  children,
  separator = true,
  first = false,
  style,
}: SectionContainerProps) {
  return (
    <View style={[styles.container, style]}>
      {separator && !first ? (
        <Separator marginTop={0} marginBottom={SPACING.section} />
      ) : null}
      {children}
    </View>
  );
}

export function Section({
  children,
  label,
  labelColor,
  separator = true,
  first = false,
  style,
}: SectionProps) {
  return (
    <SectionContainer separator={separator} first={first} style={style}>
      {label ? (
        <Text
          accessibilityRole="header"
          style={[
            styles.label,
            styles.labelWithContent,
            labelColor ? { color: labelColor } : null,
          ]}
        >
          {label}
        </Text>
      ) : null}
      {children}
    </SectionContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.section,
  },
  label: {
    ...TYPOGRAPHY.sectionLabel,
  },
  labelWithContent: {
    marginBottom: SPACING.section,
  },
});
