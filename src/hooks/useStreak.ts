"use client";

import { useState, useEffect } from "react";

export function useStreak(databaseStreak?: number) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedStreak = localStorage.getItem("campusos_streak");
    const lastActive = localStorage.getItem("campusos_last_active");
    
    // If we have a database streak but no local streak, sync it
    if (databaseStreak !== undefined && databaseStreak > 0 && !savedStreak) {
      setStreak(databaseStreak);
      localStorage.setItem("campusos_streak", databaseStreak.toString());
      localStorage.setItem("campusos_last_active", new Date().toISOString());
      return;
    }

    if (savedStreak) {
      const streakValue = parseInt(savedStreak);
      const lastDate = lastActive ? new Date(lastActive) : null;
      const today = new Date();
      
      if (lastDate) {
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          setStreak(0);
          localStorage.setItem("campusos_streak", "0");
        } else {
          setStreak(streakValue);
        }
      }
    }
  }, [databaseStreak]);

  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("campusos_streak", newStreak.toString());
    localStorage.setItem("campusos_last_active", new Date().toISOString());
  };

  return { streak, incrementStreak };
}
