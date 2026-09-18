import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Notification, UserRole, UserSession } from "@rinjani/shared-types";
import { subscribeJobTenderNotifications } from "@talent/lib/jobTenderNotifications";

const SESSION_KEY = "rinjani-integrated-session";

const defaultNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "approval",
    title: "KPI Check-In Menunggu Approval",
    message: "KPI Check-In Q4 2025 menunggu approval Anda.",
    timestamp: "2 jam lalu",
    read: false,
    sender: "Binavia Wardhani"
  },
  {
    id: "notif-2",
    type: "deadline",
    title: "Deadline Survey Engagement",
    message: "Employee Engagement Survey Q4 akan berakhir dalam 3 hari.",
    timestamp: "1 hari lalu",
    read: false
  },
  {
    id: "notif-3",
    type: "announcement",
    title: "Update Kebijakan Cuti",
    message: "Kebijakan cuti tahunan telah diperbarui.",
    timestamp: "2 hari lalu",
    read: true,
    sender: "HR Department"
  }
];

interface SessionContextValue {
  session: UserSession | null;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function buildSession(email: string, role: UserRole): UserSession {
  return {
    email,
    role,
    orgCode: "HC-001",
    orgName: "InJourney Human Capital",
    entitlements:
      role === "Admin"
        ? ["portal", "talent", "performance", "admin"]
        : ["portal", "talent", "performance"]
  };
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(() => readStoredSession());
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);

  useEffect(() => {
    setSession(readStoredSession());
  }, []);

  useEffect(() => {
    return subscribeJobTenderNotifications((notification) => {
      setNotifications((current) => [notification, ...current]);
    });
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      notifications,
      setNotifications,
      login: (email, role) => {
        const nextSession = buildSession(email, role);
        setSession(nextSession);
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      },
      logout: () => {
        setSession(null);
        window.localStorage.removeItem(SESSION_KEY);
      },
      setRole: (role) => {
        if (!session) {
          return;
        }

        const nextSession = buildSession(session.email, role);
        setSession(nextSession);
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      }
    }),
    [notifications, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return value;
}
