import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function SearchAndFilterBar({ searchQuery, setSearchQuery, onOpenFilter }) {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search stock by name or symbol..."
                placeholderTextColor="#A9A9A9"
            />
            <TouchableOpacity onPress={onOpenFilter} style={styles.filterBtn}>
                <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', padding: 10, alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#2A2A40', color: '#FFF', padding: 12, borderRadius: 10 },
    filterBtn: { backgroundColor: '#FFC107', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginLeft: 10 },
    filterText: { color: '#000', fontWeight: '600' },
});