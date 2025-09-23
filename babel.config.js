module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            ["react-native-worklets/plugin", { enforce: "pre" }],
            [
                'module-resolver',
                {
                    alias: {
                        '@': './', // Allows "@/components/..." style imports
                    },
                },
            ],
        ],
    };
};