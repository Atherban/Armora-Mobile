import { useAuthStore } from "../src/store/auth.store";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("useAuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.setItem = jest.fn();
    AsyncStorage.getItem = jest.fn();
    AsyncStorage.removeItem = jest.fn();
  });

  it("registers a user and sets token/user", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { username: "test" }, token: "abc" }),
    });
    const store = useAuthStore.getState();
    const result = await store.register("test", "test@test.com", "pass");
    expect(result.success).toBe(true);
    expect(store.user).toEqual({ username: "test" });
    expect(store.token).toBe("abc");
  });

  it("handles register error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "fail" }),
    });
    const store = useAuthStore.getState();
    const result = await store.register("test", "test@test.com", "pass");
    expect(result.success).toBe(false);
    expect(result.error).toBe("fail");
  });

  it("logs in a user and sets token/user", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { username: "test" }, token: "abc" }),
    });
    const store = useAuthStore.getState();
    const result = await store.login("test@test.com", "pass");
    expect(result.success).toBe(true);
    expect(store.user).toEqual({ username: "test" });
    expect(store.token).toBe("abc");
  });

  it("handles login error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "fail" }),
    });
    const store = useAuthStore.getState();
    const result = await store.login("test@test.com", "pass");
    expect(result.success).toBe(false);
    expect(result.error).toBe("fail");
  });

  it("checkAuth sets user/token from AsyncStorage", async () => {
    AsyncStorage.getItem = jest
      .fn()
      .mockResolvedValueOnce("token123")
      .mockResolvedValueOnce(JSON.stringify({ username: "test" }));
    const store = useAuthStore.getState();
    await store.checkAuth();
    expect(store.token).toBe("token123");
    expect(store.user).toEqual({ username: "test" });
  });

  it("logout clears user/token from AsyncStorage", async () => {
    const store = useAuthStore.getState();
    await store.logout();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("token");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user");
    expect(store.token).toBe(null);
    expect(store.user).toBe(null);
  });
});
