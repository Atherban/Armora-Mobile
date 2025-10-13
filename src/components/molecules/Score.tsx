import { StyleSheet, Text, View, Animated, Easing } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Svg, { Path, G } from "react-native-svg";

interface ScoreProps {
  score: number;
  outOf: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}

const Score: React.FC<ScoreProps> = ({
  score,
  outOf,
  size = 180,
  strokeWidth = 10,
  color = "#00bf8f",
  bgColor = "#222",
}) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = Math.PI;
  const endAngle = 0;
  const arcLength = Math.PI; // 180deg
  const percent = Math.max(0, Math.min(score / outOf, 1));

  // Animated value for score
  const animated = useRef(new Animated.Value(0)).current;
  const [displayedScore, setDisplayedScore] = useState(0);
  const [arcValue, setArcValue] = useState(0);
  useEffect(() => {
    Animated.timing(animated, {
      toValue: percent,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    const id = animated.addListener(({ value }) => {
      setDisplayedScore(Math.round(value * outOf));
      setArcValue(value * arcLength);
    });
    return () => animated.removeListener(id);
  }, [percent, outOf, animated, arcLength]);

  // Helper to describe an arc path
  const describeArc = (start: number, end: number) => {
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const largeArcFlag = end - start <= Math.PI ? "0" : "1";
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Helper to describe an arc path with custom radius
  const describeArcWithRadius = (start: number, arc: number, rad: number) => {
    const x1 = cx + rad * Math.cos(start);
    const y1 = cy + rad * Math.sin(start);
    const x2 = cx + rad * Math.cos(start + arc);
    const y2 = cy + rad * Math.sin(start + arc);
    const largeArcFlag = arc <= Math.PI ? "0" : "1";
    return `M ${x1} ${y1} A ${rad} ${rad} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size / 2}>
        <G>
          {/* Background arc */}
          <Path
            d={describeArc(startAngle, endAngle)}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Animated filled arc */}
          <Path
            d={describeArcWithRadius(startAngle, arcValue, radius)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <Text style={styles.scoreText}>{displayedScore}</Text>
      <Text style={styles.outOfText}>out of {outOf}</Text>
    </View>
  );
};

export default Score;

const styles = StyleSheet.create({
  scoreText: {
    position: "absolute",
    top: "25%",
    width: "100%",
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  outOfText: {
    position: "absolute",
    top: "70%",
    width: "100%",
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
