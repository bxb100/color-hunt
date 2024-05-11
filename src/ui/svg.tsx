import { eachHex, toBase64 } from "../utils/util";
import { usePromise } from "@raycast/utils";
import satori from "satori";
import fs from "fs";
import { Cache, environment } from "@raycast/api";

export const Svg = ({ id, show }: { show: boolean; id: string }) => {
    const display = show ? "flex" : "none";
    if (id.length !== 24) {
        throw new Error("Invalid id");
    }
    // step 6
    const hexes = eachHex(id);
    const flex = [5, 4, 3, 2];

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
            }}
        >
            {flex.map((item) => {
                const hex = hexes.next().value!;
                return (
                    <div
                        key={hex}
                        style={{
                            backgroundColor: `#${hex}`,
                            flex: item,
                            display: "flex",
                        }}
                    >
                        <span
                            style={{
                                display,
                                position: "absolute",
                                bottom: 0,
                                backgroundColor: "grey",
                                color: `#fff`,
                                padding: `4px 6px`,
                                borderRadius: "0 6px 0 0",
                                overflow: "hidden",
                                letterSpacing: "1px",
                                fontSize: `14px`,
                                width: `80px`,
                                height: `25px`,
                            }}
                        >
                            #{hex}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const fontData = fs.readFileSync(environment.assetsPath + "/Roboto-Regular.ttf");

const cache = new Cache({
    namespace: "svgs",
});
export class Svgs {
    public static async core(id: string, show: boolean, width: number, height: number) {
        const key = `${id}-${show}-${width}-${height}`;
        if (cache.has(key)) {
            return cache.get(key);
        }
        // sleep 300ms to wait for GC
        // TODO: maybe can using `global.gc()` if available
        await new Promise((resolve) => setTimeout(resolve, 50));
        const graph = await satori(<Svg show={show} id={id} />, {
            width: width,
            height: height,
            fonts: [
                {
                    name: "Roboto",
                    data: fontData,
                    weight: 400,
                    style: "normal",
                },
            ],
        });
        const base64 = toBase64(graph);
        const svg = `data:image/svg+xml;base64,${base64}`;
        cache.set(key, svg);
        return svg;
    }

    public static generate(w: number, h: number) {
        return (id: string, show: boolean) =>
            usePromise((id, show, w, h) => Svgs.core(id, show, w, h), [id, show, w, h]);
    }

    public static default() {
        return (id: string, show: boolean) => this.core(id, show, 189, 336);
    }

    public static detail() {
        return this.generate(475, 350);
    }
}
