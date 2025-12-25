import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Defs, Pattern, Circle, Rect } from "react-native-svg";

import { Colors } from "../shared/constants/Color";

const DottedBackground: React.FC = () => {
  const width = Dimensions.get("screen").width;
  const height = Dimensions.get("screen").height;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          {/* pattern cell 24x24 so dots are nicely spaced on different screens */}
          <Pattern
            id="dotPattern"
            patternUnits="userSpaceOnUse"
            width="24"
            height="24"
          >
            <Circle cx="12" cy="12" r="1.6" fill={Colors.dot} />
          </Pattern>
        </Defs>

        {/* base cream/yellow background (uses theme color) */}
        <Rect
          x="0"
          y="0"
          width={width}
          height={height + 50}
          fill={Colors.background}
        />

        {/* dotted layer on top */}
        <Rect
          x="0"
          y="0"
          width={width}
          height={height + 50}
          fill="url(#dotPattern)"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({});

export default DottedBackground;
