"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import SessionTimeoutModal from "../components/SessionTimeoutModal";

const UserContext = createContext(null);

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minuti

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Errore nel fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Tracking inattività: attivo solo quando l'utente è loggato
  useEffect(() => {
    if (!user) {
      clearInterval(timerRef.current);
      return;
    }

    lastActivityRef.current = Date.now();

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) =>
      window.addEventListener(e, resetActivity, { passive: true }),
    );

    timerRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_MS) {
        setSessionExpired(true);
        clearInterval(timerRef.current);
      }
    }, 60_000); // controlla ogni minuto

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetActivity));
      clearInterval(timerRef.current);
    };
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, loading, sessionExpired }}>
      {children}
      {sessionExpired && <SessionTimeoutModal />}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
