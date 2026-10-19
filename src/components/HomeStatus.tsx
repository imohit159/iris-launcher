import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Battery from "expo-battery";
import * as Network from "expo-network";
import type { Theme } from "../preferences";
import { TYPOGRAPHY } from "../design/tokens";

type Props = {
  theme: Theme;
  scale: number;
  top: number;
  left: boolean;
  enabled: boolean;
};

type Status = {
  battery: number | null;
  network: string;
};

const initialStatus: Status = { battery: null, network: "offline" };

export function HomeStatus({ theme, scale, top, left, enabled }: Props) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const refresh = async () => {
      const [battery, network] = await Promise.allSettled([
        Battery.getBatteryLevelAsync(),
        Network.getNetworkStateAsync(),
      ]);
      if (!mounted) return;
      setStatus({
        battery:
          battery.status === "fulfilled" && battery.value >= 0
            ? Math.round(battery.value * 100)
            : null,
        network:
          network.status === "fulfilled" && network.value.isConnected
            ? String(network.value.type).toLowerCase()
            : "offline",
      });
    };
    void refresh();
    const batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      if (mounted && batteryLevel >= 0) {
        setStatus((previous) => ({
          ...previous,
          battery: Math.round(batteryLevel * 100),
        }));
      }
    });
    const networkSubscription = Network.addNetworkStateListener((state) => {
      if (mounted) {
        setStatus((previous) => ({
          ...previous,
          network: state.isConnected ? String(state.type).toLowerCase() : "offline",
        }));
      }
    });
    return () => {
      mounted = false;
      batterySubscription.remove();
      networkSubscription.remove();
    };
  }, [enabled]);

  if (!enabled) return null;
  const battery = status.battery === null ? "—" : `${status.battery}%`;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top,
          [left ? "left" : "right"]: 28 * scale,
          alignItems: left ? "flex-start" : "flex-end",
        },
      ]}
    >
      <Text style={[styles.text, { color: theme.muted2, fontSize: 11 * scale }]}>
        {status.network} · {battery}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute" },
  text: { ...TYPOGRAPHY.meta, fontFamily: "JetBrainsMono" },
});
