import { useEffect, useRef, useState } from "react";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { friendlyError } from "./game";
import { GameContext } from "./game-context";
const SESSION_KEY = "viral-session-v1";
function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
export function GameProvider({ children }) {
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [offset, setOffset] = useState(0);
  const [replaced, setReplaced] = useState(false);
  const connection = useRef(null);
  const session = useRef(readSession());
  const saveSession = (value) => {
    session.current = value;
    if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(SESSION_KEY);
  };
  const accept = (value) => {
    if (!value?.room) return;
    setSnapshot((previous) =>
      !previous ||
      previous.room.code !== value.room.code ||
      value.room.revision >= previous.room.revision
        ? value
        : previous,
    );
    setOffset(Date.parse(value.room.serverNow) - Date.now());
  };
  useEffect(() => {
    let stopped = false;
    let retry;
    const hub = new HubConnectionBuilder()
      .withUrl("/gameHub")
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (c) =>
          Math.min(1000 * 2 ** Math.min(c.previousRetryCount, 5), 15000),
      })
      .configureLogging(LogLevel.Warning)
      .build();
    connection.current = hub;
    hub.on("Snapshot", accept);
    hub.on("SessionReplaced", () => {
      setReplaced(true);
      saveSession(null);
      setSnapshot(null);
      setStatus("connected");
    });
    const restore = async () => {
      if (session.current) {
        try {
          accept(
            await hub.invoke(
              "Reconnect",
              session.current.roomCode,
              session.current.sessionToken,
            ),
          );
        } catch (err) {
          setError(friendlyError(err));
          saveSession(null);
          setSnapshot(null);
        }
      }
      if (!stopped) setStatus("connected");
    };
    hub.onreconnecting(() => setStatus("reconnecting"));
    hub.onreconnected(restore);
    const start = async () => {
      if (stopped) return;
      try {
        await hub.start();
        if (!stopped) await restore();
      } catch {
        if (!stopped) {
          setStatus("offline");
          retry = setTimeout(start, 3000);
        }
      }
    };
    hub.onclose(() => {
      if (!stopped) {
        setStatus("offline");
        retry = setTimeout(start, 3000);
      }
    });
    start();
    return () => {
      stopped = true;
      clearTimeout(retry);
      hub.stop();
    };
  }, []);
  const invoke = async (method, ...args) => {
    if (
      connection.current?.state !== HubConnectionState.Connected ||
      status !== "connected"
    )
      throw new Error("Đang kết nối lại. Vui lòng chờ.");
    return connection.current.invoke(method, ...args);
  };
  const enter = async (method, ...args) => {
    setBusy(method);
    setError("");
    try {
      const response = await invoke(method, ...args);
      saveSession({
        roomCode: response.roomCode,
        sessionToken: response.sessionToken,
        isHost: response.isHost,
      });
      accept(response.snapshot);
      setReplaced(false);
      return response;
    } catch (err) {
      setError(friendlyError(err));
      return null;
    } finally {
      setBusy("");
    }
  };
  const act = async (method, ...args) => {
    setBusy(method);
    setError("");
    try {
      await invoke(method, ...args);
      return true;
    } catch (err) {
      setError(friendlyError(err));
      return false;
    } finally {
      setBusy("");
    }
  };
  const leave = async () => {
    if (snapshot && status === "connected" && !(await act("LeaveRoom")))
      return false;
    saveSession(null);
    setSnapshot(null);
    setError("");
    setReplaced(false);
    return true;
  };
  return (
    <GameContext.Provider
      value={{
        snapshot,
        status,
        error,
        setError,
        busy,
        offset,
        replaced,
        enter,
        act,
        leave,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

