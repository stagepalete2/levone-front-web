import { useEffect, useRef, useState } from "react"

const useCountdown = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const endTimeRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    if (!duration || duration <= 0) return;

    endTimeRef.current = Date.now() + duration;
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!endTimeRef.current) return;

      const diff = endTimeRef.current - Date.now();

      if (diff <= 0) {
        setTimeLeft(0);
        endTimeRef.current = null;
        onCompleteRef.current?.();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
};

export default useCountdown;
