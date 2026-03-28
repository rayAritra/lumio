import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

let webcontainerPromise: Promise<WebContainer> | null = null;
let webcontainerInstance: WebContainer | null = null;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();

    useEffect(() => {
        if (!webcontainerPromise) {
            webcontainerPromise = WebContainer.boot();
        }

        webcontainerPromise.then((instance) => {
            webcontainerInstance = instance;
            setWebcontainer(instance);
        }).catch((err) => {
            console.error("Failed to boot WebContainer:", err);
        });
    }, []);

    return webcontainer;
}