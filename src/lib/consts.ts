import type { ColorOption } from "./types";
export const colorOptions: ColorOption[] = [
    "pink",
    "yellow",
    "blue",
    "orange",
    "salmon"
];
export const switchColorBgMap: Record<ColorOption, string> = {
    pink: "data-[state=checked]:bg-pink",
    yellow: "data-[state=checked]:bg-yellow",
    blue: "data-[state=checked]:bg-blue",
    orange: "data-[state=checked]:bg-orange",
    salmon: "data-[state=checked]:bg-salmon",
}
export const colorBgMap: Record<ColorOption, string> = {
    pink: "bg-pink",
    yellow: "bg-yellow",
    blue: "bg-blue",
    orange: "bg-orange",
    salmon: "bg-salmon",
}

