import { StyleSheet, View } from "react-native";
import { DIVIDERS, SPACING } from "../design/tokens";

type Props = {
  color?: string;
  fullBleed?: boolean;
  marginBottom?: number;
  marginTop?: number;
};

export function Separator({
  color = DIVIDERS.subtle,
  fullBleed = false,
  marginBottom = 0,
  marginTop = SPACING.dividerTop,
}: Props) {
  return (
    <View
      accessible={false}
      style={[
        styles.line,
        fullBleed && styles.fullBleed,
        { backgroundColor: color, marginBottom, marginTop },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
  },
  fullBleed: {
    marginHorizontal: -SPACING.screen,
  },
});
