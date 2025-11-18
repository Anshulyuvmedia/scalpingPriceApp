// constants/OptionStrategySVGs.js
import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

const SVG = { width: 140, height: 100, viewBox: "0 0 62 45" };

export const OptionStrategySVGs = {
    // BULLISH
    "Buy Call": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <Path stroke="red" strokeWidth="2" d="M2 31L30 31L38 23" />
                <Path stroke="green" strokeWidth="2" d="M38 23L56 8" />
            </G>
        </Svg>
    ),

    "Sell Put": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <Path stroke="red" strokeWidth="2" d="M2 38L16 23" />
                <Path stroke="green" strokeWidth="2" d="M16 23L32 7L57 7" />
            </G>
        </Svg>
    ),

    "Bull Call Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <Path stroke="red" strokeWidth="2" d="M1 32L15 32L25 23" />
                <Path stroke="green" strokeWidth="2" d="M25 23L45 6L60 6" />
            </G>
        </Svg>
    ),

    "Bull Put Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <Path stroke="red" strokeWidth="2" d="M2 39L13 39L31 23" />
                <Path stroke="green" strokeWidth="2" d="M31 23L39 16L56 16" />
            </G>
        </Svg>
    ),

    "Call Ratio Back Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(2 9)">
                    <Path stroke="red" d="M0 20L27 20L32 25L40 16" />
                    <Path stroke="green" d="M40 16L54 0.5" />
                </G>
            </G>
        </Svg>
    ),

    // BEARISH
    "Buy Put": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(57 8) scale(-1,1)">
                    <Path stroke="red" d="M1 23L29 23L37 16" />
                    <Path stroke="green" d="M37 16L55 0" />
                </G>
            </G>
        </Svg>
    ),

    "Sell Call": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(1 39) scale(1,-1)">
                    <Path stroke="green" d="M0 23L27 23L35 16" />
                    <Path stroke="red" d="M35 16L53 0" />
                </G>
            </G>
        </Svg>
    ),

    "Bear Put Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(1 30) scale(1,-1)">
                    <Path stroke="green" d="M0 23L12 23L30 7" />
                    <Path stroke="red" d="M30 7L38 0L55 0" />
                </G>
            </G>
        </Svg>
    ),

    "Bear Call Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 14L60 14" />
                <G strokeWidth="2" transform="translate(1 30) scale(1,-1)">
                    <Path stroke="green" d="M0 23L12 23L19 16" />
                    <Path stroke="red" d="M19 16L38 0L55 0" />
                </G>
            </G>
        </Svg>
    ),

    "Put Ratio Back Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(56 8) scale(-1,1)">
                    <Path stroke="red" d="M0 20L27 20L32 25L40 16" />
                    <Path stroke="green" d="M40 16L54 0.5" />
                </G>
            </G>
        </Svg>
    ),

    // NEUTRAL
    "Short Straddle": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(2 7)">
                    <Path stroke="green" d="M0 33L8 24L14 17" />
                    <Path stroke="red" d="M14 17L29 0" />
                    <G transform="translate(57 0) scale(-1,1)">
                        <Path stroke="green" d="M0 33L8 24L14 17" />
                        <Path stroke="red" d="M14 17L29 0" />
                    </G>
                </G>
            </G>
        </Svg>
    ),

    "Iron Butterfly": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <Path stroke="red" strokeWidth="2" d="M2 32L18 32L21.5 23" />
                <Path stroke="red" strokeWidth="2" d="M56 32L40 32L36.5 23" />
                <Path stroke="green" strokeWidth="2" d="M21.5 23L28 4L35.5 23" />
            </G>
        </Svg>
    ),

    "Short Strangle": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <Path stroke="red" strokeWidth="2" d="M2 38L8 23" />
                <Path stroke="red" strokeWidth="2" d="M56 38L50 23" />
                <Path stroke="green" strokeWidth="2" d="M8 23L12 10L46 10L50 23" />
            </G>
        </Svg>
    ),

    "Short Iron Condor": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <Path stroke="red" strokeWidth="2" d="M2 32L13 32L16.5 23" />
                <Path stroke="red" strokeWidth="2" d="M56 32L45 32L41.5 23" />
                <Path stroke="green" strokeWidth="2" d="M16.5 23L23 4L35 4L41.5 23" />
            </G>
        </Svg>
    ),

    // OTHERS / VOLATILITY
    "Put Ratio Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <Path stroke="gray" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <G strokeWidth="2">
                    <Path stroke="green" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) rotate(180 27.5 19.5)" />
                    <Path stroke="red" d="M40 16L54 0.5" transform="translate(1 1) rotate(180 27.5 19.5)" />
                </G>
            </G>
        </Svg>
    ),

    "Call Ratio Spread": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(2 39) scale(1,-1)">
                    <Path stroke="green" d="M0 20L27 20L32 25L40 16" />
                    <Path stroke="red" d="M40 16L54 0.5" />
                </G>
            </G>
        </Svg>
    ),

    "Long Straddle": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2" transform="translate(2 39) scale(1,-1)">
                    <Path stroke="green" d="M0 33L8 24L14 17" />
                    <Path stroke="red" d="M14 17L29 0" />
                    <G transform="translate(57 0) scale(-1,1)">
                        <Path stroke="green" d="M0 33L8 24L14 17" />
                        <Path stroke="red" d="M14 17L29 0" />
                    </G>
                </G>
            </G>
        </Svg>
    ),

    "Long Iron Butterfly": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 19L60 19" />
                <G strokeWidth="2">
                    <Path stroke="green" d="M0 28.5L17.418 28.5 21 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                    <Path stroke="green" d="M35 28.5L52.418 28.5 56 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38) matrix(-1 0 0 1 91 0)" />
                    <Path stroke="red" d="M21 19L27.744 0 35 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                </G>
            </G>
        </Svg>
    ),

    "Iron Strangle": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 23L60 23" />
                <G strokeWidth="2">
                    <Path stroke="green" d="M0 28.5L5.75 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36)" />
                    <Path stroke="green" d="M47.521 28.5L52.534 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36) matrix(-1 0 0 1 100.055 0)" />
                    <Path stroke="red" d="M5.75 13L10.325 0 43.61 0 47.521 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36)" />
                </G>
            </G>
        </Svg>
    ),

    "Long Iron Condor": (
        <Svg {...SVG}>
            <G fill="none">
                <Path stroke="gray" d="M1.5 1L1.5 43" />
                <Path stroke="gray" strokeDasharray="5,5" d="M1.5 19L60 19" />
                <G strokeWidth="2">
                    <Path stroke="green" d="M0 28.5L12.418 28.5 16 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                    <Path stroke="green" d="M40 28.5L52.418 28.5 56 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38) matrix(-1 0 0 1 96 0)" />
                    <Path stroke="red" d="M16 19L22.744 0 34.028 0 40 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                </G>
            </G>
        </Svg>
    ),
};