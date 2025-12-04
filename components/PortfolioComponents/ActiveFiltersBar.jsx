// components/portfolio/ActiveFiltersBar.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ActiveFiltersBar({ activeFilters, onRemoveFilter }) {
    if (activeFilters.length === 0) return null;

    return (
        <View style={styles.container}>
            {activeFilters.map(filter => (
                <View key={filter.key} style={styles.tag}>
                    <Text style={styles.tagText}>{filter.label}</Text>
                    <TouchableOpacity onPress={() => onRemoveFilter(filter.key)}>
                        <MaterialIcons name="close" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingBottom: 10 },
    tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A40', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginTop: 5 },
    tagText: { color: '#FFF', marginRight: 8, fontSize: 13 },
});