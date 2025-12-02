import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getSharedStyles = (
  iconSize: number,
  numColumns: number,
  colorful?: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    iconContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      aspectRatio: 1,
      maxWidth: width / numColumns,
    },
    icon: {
      fontSize: iconSize,
      color: colorful ? '#ff0000' : undefined,
    },
    debugSection: {
      position: 'absolute',
      top: 8,
      right: 8,
      padding: 4,
      backgroundColor: 'rgba(249, 249, 249, 0.9)',
      borderRadius: 4,
      zIndex: 1000,
    },
    debugTitle: {
      fontSize: 8,
      fontWeight: '600',
      marginBottom: 2,
    },
    counterItem: {
      backgroundColor: '#fff',
      padding: 2,
      borderRadius: 2,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    counterId: {
      fontSize: 7,
      fontWeight: '600',
      marginBottom: 1,
    },
    counterText: {
      fontSize: 7,
      color: '#666',
      marginTop: 1,
    },
  });
