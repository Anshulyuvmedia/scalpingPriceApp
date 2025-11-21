// components/ActionSheet.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

const ActionSheet = ({ refRBSheet, title, message, onConfirm, confirmText = "Confirm", cancelText = "Cancel", loading = false }) => {
    // console.log('message:', message);

    return (
        <RBSheet
            ref={refRBSheet}
            height={300}
            openDuration={250}
            customStyles={{
                container: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    backgroundColor: '#111114',
                },
            }}
        >
            <View className="px-6 pt-6">
                <Text className="text-white text-2xl font-sora-bold text-center">{title}</Text>
                <Text className="text-[#AEAEB9] text-center mt-4 font-questrial">{message}</Text>

                <View className="mt-10 flex-row gap-4">
                    <TouchableOpacity
                        onPress={() => refRBSheet.current?.close()}
                        className="flex-1 bg-[#333] py-4 rounded-2xl"
                        disabled={loading}
                    >
                        <Text className="text-white text-center font-sora-semibold">{cancelText}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            onConfirm();
                            // Optionally close after confirm
                        }}
                        className={`flex-1 py-4 rounded-2xl ${title.includes('Delete') || title.includes('Cancel') ? 'bg-red-600' : 'bg-[#05FF93]'
                            }`}
                        disabled={loading}
                    >
                        <Text className="text-black text-center font-sora-bold">
                            {loading ? 'Processing...' : confirmText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </RBSheet>
    );
};

export default ActionSheet;