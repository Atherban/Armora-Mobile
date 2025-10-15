// src/assets/styles/security.style.ts
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Dark theme
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
  },
  scroll: {
    paddingVertical: 24,
    width: "100%",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "95%",
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#00bf8f",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  cardSubTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 4,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    color: "#ccc",
    fontWeight: "500",
  },
  scanButtonWrapper: {
    width: "95%",
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default styles;
