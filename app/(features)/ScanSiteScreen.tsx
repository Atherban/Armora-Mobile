import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Linking,
  Animated as RNAnimated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import UserInput from "@/src/components/atoms/UserInput";
import { Ionicons } from "@expo/vector-icons";

const SPEEDOMETER_COLORS = ["#3ec46d", "#f7c873", "#e14b5a"];
const SPEEDOMETER_LABELS = ["Safe", "Warning", "Risky"];

export default function ScanSiteScreen() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [score, setScore] = useState(90); // Default for demo
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.96, 420);
  const pointerAnim = useRef(new RNAnimated.Value(score)).current;

  // Animate pointer to score
  const animatePointer = (toScore: number) => {
    RNAnimated.timing(pointerAnim, {
      toValue: toScore,
      duration: 900,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  };

  const handleScan = () => {
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      const fakeScore = Math.floor(Math.random() * 101); // 0-100
      setScore(fakeScore);
      animatePointer(fakeScore);
      setScanning(false);
      setScanned(true);
    }, 1200);
  };

  // Calculate pointer angle (deg): 0 (left) to 180 (right)
  const pointerAngle = pointerAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 180],
  });

  // Speedometer color and label
  let speedColor = SPEEDOMETER_COLORS[0];
  let speedLabel = SPEEDOMETER_LABELS[0];
  if (score < 40) {
    speedColor = SPEEDOMETER_COLORS[2];
    speedLabel = SPEEDOMETER_LABELS[2];
  } else if (score < 70) {
    speedColor = SPEEDOMETER_COLORS[1];
    speedLabel = SPEEDOMETER_LABELS[1];
  }

  const handleOpenUrl = () => {
    if (url && url.startsWith("http")) {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Scan Website</Text>
        {/* Speedometer */}
        <View style={styles.gaugeWrapper}>
          <View style={styles.gaugeSvgContainer}>
            <Svg width={240} height={140} viewBox="0 0 240 140">
              {/* Green arc */}
              <Path
                d="M30 120 A90 90 0 0 1 120 30"
                stroke="#00bf8f"
                strokeWidth={18}
                fill="none"
                strokeLinecap="round"
              />
              {/* Yellow arc */}
              <Path
                d="M120 30 A90 90 0 0 1 210 120"
                stroke="#FFD700"
                strokeWidth={18}
                fill="none"
                strokeLinecap="round"
              />
              {/* Red arc */}
              <Path
                d="M210 120 A90 90 0 0 1 30 120"
                stroke="#FF6347"
                strokeWidth={18}
                fill="none"
                strokeLinecap="round"
              />
              {/* Center black circle for pointer base */}
              <Circle cx={120} cy={120} r={30} fill="#181818" />
            </Svg>
            {/* Animated pointer centered at bottom middle */}
            <RNAnimated.View
              style={[
                styles.pointerContainer,
                {
                  left: 120 - 4,
                  top: 120 - 60,
                  transform: [
                    {
                      rotate: pointerAngle.interpolate({
                        inputRange: [0, 180],
                        outputRange: ["-90deg", "90deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.pointer, { backgroundColor: speedColor }]} />
              <View style={styles.pointerBase} />
            </RNAnimated.View>
          </View>
          <Text style={[styles.gaugeLabel, { color: speedColor }]}>
            {speedLabel}
          </Text>
        </View>
        {/* Search Input */}
        <View style={styles.searchInputBlock}>
          <View style={styles.searchInputWrapper}>
            <UserInput
              label="Link"
              value={url}
              onChangeText={setUrl}
              placeholder="https://www.google.co.in"
              autoCapitalize="none"
              keyboardType="url"
              style={styles.userInput}
            />
            <TouchableOpacity
              style={styles.searchIconBtn}
              onPress={handleScan}
              disabled={scanning || !url.trim()}
            >
              <Ionicons name="search" size={22} color="#00bf8f" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Scan Button */}
        <TouchableOpacity
          style={styles.scanButtonWrapper}
          activeOpacity={0.85}
          onPress={handleScan}
          disabled={scanning || !url.trim()}
        >
          <LinearGradient
            colors={["#00bf8f", "#001510"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanButton}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.scanButtonText}>
                {scanning ? "Scanning..." : "Scan Website"}
              </Text>
              <Ionicons
                name="globe-outline"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {/* Risk Analysis Card (only after scan) */}
        {scanned && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Risk Analysis</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Site Grade</Text>
              <Text style={[styles.value, { color: "#00bf8f" }]}>
                {score > 85 ? "A" : score > 70 ? "B" : score > 50 ? "C" : "D"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Security Score</Text>
              <Text style={[styles.value, { color: "#00bf8f" }]}>
                {score} / 100
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Synopsis</Text>
              <Text style={[styles.value, { color: "#00bf8f" }]}>
                {score > 85
                  ? "Minimal Issues"
                  : score > 70
                  ? "Low Risk"
                  : score > 50
                  ? "Moderate Risk"
                  : "High Risk"}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: {
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  header: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginVertical: 16,
    letterSpacing: 1.1,
    textAlign: "center",
    alignSelf: "center",
  },
  gaugeWrapper: {
    width: 240,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 18,
  },
  gaugeSvgContainer: {
    width: 240,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pointerContainer: {
    position: "absolute",
    width: 8,
    height: 60,
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 2,
  },
  pointer: {
    width: 8,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#00bf8f",
    shadowColor: "#00bf8f",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  pointerBase: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#181818",
    borderWidth: 4,
    borderColor: "#222",
    position: "absolute",
    bottom: -15,
    left: -11,
  },
  gaugeLabel: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 1.1,
  },
  searchInputBlock: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181818",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#00bf8f",
    paddingHorizontal: 10,
    paddingVertical: 2,
    width: "100%",
  },
  userInput: {
    flex: 1,
    backgroundColor: "#181818",
    borderWidth: 0,
    color: "#fff",
    fontSize: 16,
    marginBottom: 0,
    paddingLeft: 0,
  },
  searchIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#181818",
    marginLeft: 4,
    borderWidth: 1.5,
    borderColor: "#00bf8f",
  },
  scanButtonWrapper: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 18,
    alignSelf: "center",
  },
  scanButton: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1.1,
    textTransform: "none",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#111",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#00bf8f",
    marginTop: 10,
    marginBottom: 18,
    padding: 16,
    alignSelf: "center",
    shadowColor: "#00bf8f",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    backgroundColor: "#181818",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
    borderWidth: 1.2,
    borderColor: "#00bf8f",
  },
  cardHeaderText: {
    color: "#00bf8f",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.7,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    width: "100%",
  },
  label: { color: "#fff", fontSize: 15 },
  value: { color: "#fff", fontWeight: "500", fontSize: 15 },
});
