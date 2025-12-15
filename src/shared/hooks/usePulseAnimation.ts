import { useRef, useEffect } from "react";
import { Animated } from "react-native";

export const usePulseAnimation = (
  shouldAnimate: boolean,
  duration: number = 800
) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (shouldAnimate) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [shouldAnimate, pulseAnim, duration]);

  return pulseAnim;
};
