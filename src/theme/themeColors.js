import { Colors } from "../utils/Colors";

export const getThemeColors = theme => ({
  backgroundColor: theme === 'dark' ? '#121212' : '#fff',
  textColor: theme === 'dark' ? '#fff' : Colors.BLACK,
  borderColor: theme === 'dark' ? '#292929' : '#ecf0f1',
  dropdownValueColor: theme === 'dark' ? '#ff7961' : '#900',
  iconColor: theme === 'dark' ? Colors.GRAY : Colors.BLACK,
  headerColor: theme === 'dark' ? Colors.WHITE : Colors.BLACK,
});
