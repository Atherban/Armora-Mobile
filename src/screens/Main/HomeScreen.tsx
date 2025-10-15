import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeCards from "@/src/components/atoms/HomeCards";
import SecurityGrid from "@/src/components/molecules/SecurityGrid";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Animatable from "react-native-animatable";
import Score from "@/src/components/molecules/Score";
import { useScoreStore } from "../../store/score.store.js";
import COLORS from "@/src/constants/colors.js";

const HomeScreen = () => {
  const { deviceSecurity, analyzeDeviceSecurity, isLoading } = useScoreStore();

  useEffect(() => {
    analyzeDeviceSecurity();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.black }}>
      <View style={styles.scrollContent}>
        {/* Animated Score and HomeCards */}
        <Animatable.View
          animation="fadeInDown"
          duration={800}
          style={{ alignItems: "center" }}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#00bf8f"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <Animatable.View
              animation="pulse"
              iterationCount={1}
              duration={800}
            >
              <Score score={deviceSecurity.score} outOf={10} />
            </Animatable.View>
          )}

          <HomeCards />
        </Animatable.View>

        {/* Header Text */}
        <Animated.Text
          entering={FadeInUp.duration(800).delay(200)}
          style={styles.headerText}
        >
          Explore Your Security Suite
        </Animated.Text>

        {/* Security Grid */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(400)}
          style={styles.tilecontainer}
        >
          <SecurityGrid />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 8,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 26,
    textAlign: "center",
  },
  tilecontainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexWrap: "wrap",
  },
});
