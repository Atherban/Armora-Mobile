import { isLoggedIn } from "../services/auth";
import * as SecureStore from "expo-secure-store";

describe("isLoggedIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SecureStore.getItemAsync = jest.fn();
  });

  it("returns true if token exists", async () => {
    SecureStore.getItemAsync.mockResolvedValue("token123");
    const result = await isLoggedIn();
    expect(result).toBe(true);
  });

  it("returns false if token does not exist", async () => {
    SecureStore.getItemAsync.mockResolvedValue(null);
    const result = await isLoggedIn();
    expect(result).toBe(false);
  });
});