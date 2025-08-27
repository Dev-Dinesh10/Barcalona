import React, { useRef, useState } from "react";
import { View, Text, Button } from "react-native";

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <View style={{ marginTop: 100, padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Time: {time}s</Text>
      <Button title="Start" onPress={startTimer} />
      <Button title="Stop" onPress={stopTimer} />
    </View>
  );
}
