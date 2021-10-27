import React, { useCallback } from "react";
import Utils from "../util";

export default function NodeSelector(props) {
    const { value, onChange } = props;
    const changeSelector = useCallback((e) => {
        e.preventDefault();
        Utils.getSelector(onChange);
    }, [onChange]);
    const onUserChange = useCallback((e) => {
        e.preventDefault();
        onChange(e.target.value);
    }, [onChange]);
    return (
        <div className="node-sel">
            <input
                name="node"
                title="CSS Selector of Element"
                placeholder="Element"
                className="assertion-node input-sm"
                onChange={onUserChange}
                value={value}
            />
            <button onClick={changeSelector} className="btn btn-secondary btn-sm glyphicon glyphicon-import"></button>
        </div>
    );
}
