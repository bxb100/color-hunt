import { environment, LocalStorage } from "@raycast/api";
import path from "node:path";
import fs from "fs";
import { StorageData } from "../type";

const file = path.join(environment.supportPath, "likes.json");

export async function readIds() {
    const data = await LocalStorage.getItem<string>("likes");
    return data ? data.split(",") : [];
}

export async function read(): Promise<StorageData[]> {
    try {
        const data = fs.readFileSync(file, "utf-8");
        return JSON.parse(data) as unknown as StorageData[];
    } catch (error) {
        return [];
    }
}

export async function write(code: string, svg: string) {
    await LocalStorage.setItem("likes", (await readIds()).concat(code).join(","));
    const storageData = await read();
    const data = storageData.filter((item) => item.code !== code);
    data.push({ code, svg });
    fs.writeFileSync(file, JSON.stringify(data.sort()));
}

export async function remove(code: string) {
    await LocalStorage.setItem("likes", (await readIds()).filter((item) => item !== code).join(","));
    const storageData = await read();
    const data = storageData.filter((item) => item.code !== code);
    fs.writeFileSync(file, JSON.stringify(data.sort()));
}
