import { useCallback, useEffect } from "react";
import Utils from "../util";

export default function useGrabEvent(props: { captureCB?: (grabbedEvent) => void; enableMouseEvents?: boolean; }) {
    const { captureCB, enableMouseEvents } = props;
    const evnts = ['click', 'focus', 'blur', 'keyup', 'keydown', 'keypressed', 'scroll', 'resize', 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop', 'selectionchange'];
    if (enableMouseEvents) {
        evnts.push('mouseup', 'mousedown', 'mousemove');
    }
    const stopGrab = useCallback(() => {
        Utils.ungrabEvents(evnts, captureCB);
    }, [evnts]);
    const startGrab = useCallback(() => {
        Utils.grabEvents(evnts, captureCB);
    }, [evnts]);
    useEffect(() => {
        return stopGrab;
    }, []);
    return { stopGrab, startGrab };
}
