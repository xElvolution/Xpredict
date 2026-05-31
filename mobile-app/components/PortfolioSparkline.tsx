import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

export function PortfolioSparkline({ data, height = 56 }: { data: number[]; height?: number }) {
  if (data.length < 2) return null;

  const w = 320;
  const pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1));
  const ys = data.map((v) => height - pad - ((v - min) / range) * (height - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)} ${height - pad} L ${xs[0].toFixed(1)} ${height - pad} Z`;

  const last = data[data.length - 1];
  const positive = last >= data[0];
  const accent = positive ? colors.positive : colors.negative;

  return (
    <View style={{ width: '100%', height }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={accent} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#sparkGrad)" />
        <Path d={path} stroke={accent} strokeWidth={1.6} fill="none" />
        <Circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={3} fill={accent} />
      </Svg>
    </View>
  );
}
