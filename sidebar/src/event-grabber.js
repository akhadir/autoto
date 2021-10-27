import React, { useState, useMemo, useCallback } from 'react';

export const EventGrabber = () => {
    const [grabStarted, setGrabStarted] = useState(false);
    const grabLabel = useMemo(() => {
        return !grabStarted ? 'Start' : 'Stop';
    }, [grabStarted]);
    const onClick = useCallback(() => {
        setGrabStarted((started) => !grabStarted);
    }, []);
    return (
        <div className="grab-event row form-control-static">
            <div class="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                <label for="grab-event">Grab Event(s): </label>
            </div>
            <div id="grab-event" class="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                <button onClick={onClick} className="grab-event-btn btn btn-sm btn-secondary">{grabLabel}</button>
            </div>
        </div>
    );
};

export default EventGrabber;
