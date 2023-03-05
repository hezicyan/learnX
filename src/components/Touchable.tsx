import {
  Platform,
  TouchableHighlight,
  TouchableHighlightProps,
  TouchableOpacity,
} from 'react-native';
import {TouchableRipple, useTheme} from 'react-native-paper';

const Touchable: React.FC<
  TouchableHighlightProps & {type?: 'opacity' | 'highlight'}
> = ({type, ...props}) => {
  const theme = useTheme();

  return Platform.OS === 'android' ? (
    <TouchableRipple {...(props as any)} />
  ) : type === 'opacity' ? (
    <TouchableOpacity activeOpacity={0.5} {...props} />
  ) : (
    <TouchableHighlight
      activeOpacity={1}
      underlayColor={
        theme.dark ? 'rgba(255,255,255,0.125)' : 'rgba(0,0,0,0.125)'
      }
      {...props}
    />
  );
};

export default Touchable;
