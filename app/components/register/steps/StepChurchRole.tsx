import { Platform } from 'react-native';
import StepChurchRoleIOS from './StepChurchRole.ios';
import StepChurchRoleAndroid from './StepChurchRole.android';

const StepChurchRole = Platform.OS === 'ios' ? StepChurchRoleIOS : StepChurchRoleAndroid;

export default StepChurchRole;
