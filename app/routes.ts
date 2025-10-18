import { type RouteConfig, index, layout } from "@react-router/dev/routes";

export default [
    layout("routes/_layouts.tsx", [
        index("routes/home.tsx"),
        { path: "/tamagochi", file: "routes/tamagochi.tsx" }
    ])
] satisfies RouteConfig;
