import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeCards from "@/src/components/atoms/HomeCards";
import SecurityGrid from "@/src/components/molecules/SecurityGrid";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import Score from "@/src/components/molecules/Score";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={styles.scrollContent}>
        {/* Animate Score and HomeCards together for unified entrance */}
        <Animated.View entering={FadeInDown.duration(800)}>
          <Score score={3} outOf={5} />
          <HomeCards />
        </Animated.View>
        <Animated.Text
          entering={FadeInUp.duration(800).delay(200)}
          style={styles.headerText}
        >
          Explore Your Security Suite
        </Animated.Text>
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
