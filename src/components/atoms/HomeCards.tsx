import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";

// HomeCards is a responsive card component for the dashboard header
const HomeCards = () => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.92, 420); // More responsive, max 420px
  return (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <LinearGradient
        colors={["#00bf8f", "#000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.innerCard}>
          <Text style={styles.label}>Secure Your Device Now with</Text>
          <Text style={styles.labelMain}>Armora-X</Text>
          <View style={styles.divider} />
          <Text style={styles.subText}>
            Next-gen security, powered by AI. Stay protected, stay ahead.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default HomeCards;

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: "center",
  },
  gradientBorder: {
    borderRadius: 32,
    padding: 3,
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  innerCard: {
    backgroundColor: "#000",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    opacity: 0.85,
    letterSpacing: 0.5,
  },
  labelMain: {
    width: "100%",
    marginTop: 10,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "#00bf8f",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 38,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
    textTransform: "uppercase",
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: "#00bf8f",
    borderRadius: 2,
    marginVertical: 10,
    opacity: 0.8,
  },
  subText: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    opacity: 0.7,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
});
