import { Platform } from 'react-native';
import StepDiscoveryIOS from './StepDiscovery.ios';
import StepDiscoveryAndroid from './StepDiscovery.android';

const StepDiscovery = Platform.OS === 'ios' ? StepDiscoveryIOS : StepDiscoveryAndroid;

export default StepDiscovery;
