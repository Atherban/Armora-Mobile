import COLORS from "@/src/constants/colors";
import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { padding: 20, alignItems: "center" },
  header: {
    textAlign: "center",
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    letterSpacing: 1,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerIcon: {
    backgroundColor: "#f0f9f7",
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
  inputSection: {
    width: "100%",
    gap: 16,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanIcon: {
    marginRight: 6,
  },
  scoreContainer: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  checkDetail: {
    marginBottom: 16,
  },
  summary: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    opacity: 0.6,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  /** Gauge */
  gaugeWrapper: {
    alignItems: "center",
    marginVertical: 20,
  },
  gaugeContainer: {
    width: width * 0.8,
    height: 160,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pointer: {
    position: "absolute",
    zIndex: 1,
    width: 4,
    height: 85,
    borderRadius: 2,
    top: 70,
    left: "50%",
    marginLeft: -2,
    transformOrigin: "bottom center",
  },
  pointerCenter: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#111",
    borderWidth: 2,
    borderColor: "#00bf8f",
    bottom: -5,
  },
  statusLabel: {
    width: "100%",
    textTransform: "uppercase",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    letterSpacing: 1.2,
  },

  /** Buttons & Inputs */
  scanButton: {
    borderRadius: 14,
    marginTop: 14,
    overflow: "hidden",
    width: "100%",
    maxWidth: 420,
  },
  scanGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  scanText: { color: "#fff", fontSize: 17, fontWeight: "600" },

  /** Result */
  resultCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#00bf8f",
    padding: 16,
    width: "100%",
    maxWidth: 420,
    marginTop: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#00bf8f33",
    marginVertical: 8,
  },
  detailsBlock: {
    marginTop: 10,
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00bf8f22",
    padding: 10,
  },
  subHeader: {
    color: "#00bf8f",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 2,
  },
  descText: {
    color: "#ccc",
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 6,
  },
  value: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 15,
    flexShrink: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    gap: 6,
  },

  cardTitle: {
    color: "#00bf8f",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
  },

  label: { color: "#ccc", fontSize: 15 },

});
