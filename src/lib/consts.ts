import type { ColorOption } from "./types";
export const colorOptions: ColorOption[] = [
    "pink",
    "yellow",
    "blue",
    "orange",
    "salmon",
    "red",
    "green",
    "white",
    "purple"
];
export const switchColorBgMap: Record<ColorOption, string> = {
    pink: "data-[state=checked]:bg-pink",
    yellow: "data-[state=checked]:bg-yellow",
    blue: "data-[state=checked]:bg-blue",
    orange: "data-[state=checked]:bg-orange",
    salmon: "data-[state=checked]:bg-salmon",
    red: "data-[state=checked]:bg-red",
    green: "data-[state=checked]:bg-green",
    white: "data-[state=checked]:bg-white",
    purple: "data-[state=checked]:bg-purple",
}


export const hoverColorBgMap: Record<ColorOption, string> = {
    pink: "data-highlighted:bg-pink data-[state=open]:bg-pink",
    yellow: "data-highlighted:bg-yellow data-[state=open]:bg-yellow",
    blue: "data-highlighted:bg-blue data-[state=open]:bg-blue",
    orange: "data-highlighted:bg-orange data-[state=open]:bg-orange",
    salmon: "data-highlighted:bg-salmon data-[state=open]:bg-salmon",
    red: "data-highlighted:bg-red data-[state=open]:bg-red",
    green: "data-highlighted:bg-green data-[state=open]:bg-green",
    white: "data-highlighted:bg-white data-[state=open]:bg-white",
    purple: "data-highlighted:bg-purple data-[state=open]:bg-purple",
}

export const colorBgMap: Record<ColorOption, string> = {
    pink: "bg-pink",
    yellow: "bg-yellow",
    blue: "bg-blue",
    orange: "bg-orange",
    salmon: "bg-salmon",
    red: "bg-red",
    green: "bg-green",
    white: "bg-white",
    purple: "bg-purple",
}

export const colorBorderMap: Record<ColorOption, string> = {
    pink: "border-pink-border",
    yellow: "border-yellow-border",
    blue: "border-blue-border",
    orange: "border-orange-border",
    salmon: "border-salmon-border",
    red: "border-red-border",
    green: "border-green-border",
    white: "border-white-border",
    purple: "border-purple-border",
}


export const colorBorderBgMap: Record<ColorOption, string> = {
    pink: "bg-pink-border",
    yellow: "bg-yellow-border",
    blue: "bg-blue-border",
    orange: "bg-orange-border",
    salmon: "bg-salmon-border",
    red: "bg-red-border",
    green: "bg-green-border",
    white: "bg-white-border",
    purple: "bg-purple-border",
}
