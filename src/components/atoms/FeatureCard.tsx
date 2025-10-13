// src/components/FeatureCard.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type FeatureCardProps = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  gradientColors?: string[]; // custom gradient
};

export default function FeatureCard({
  icon,
  label,
  onPress,
  style,
  labelStyle,
  gradientColors = ["#00bf8f", "#001510"], // default dark gradient
}: FeatureCardProps) {
  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {icon}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  label: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff", // white text for dark cards
  },
});
