import React, { useState, useMemo, useCallback } from 'react';
import useGrabEvent from './use-grab-event';

export const EventGrabber = (props) => {
    const [grabStarted, setGrabStarted] = useState(false);
    const { onGrab } = props; 
    const { startGrab, stopGrab } = useGrabEvent({
        captureCB: onGrab ? onGrab : (e) => {
            console.log('Events Captured: ', e);
        }
    });
    const grabLabel = useMemo(() => {
        return !grabStarted ? 'Start' : 'Stop';
    }, [grabStarted]);
    const toggleGrab = useCallback((e) => {
        e.preventDefault();
        if (grabStarted) {
            stopGrab();
        } else {
            startGrab();
        }
        setGrabStarted(!grabStarted);
    }, [grabStarted]);
    return (
        <div className="grab-event row form-control-static">
            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
                <label htmlFor="grab-event">Grab Event(s): </label>
            </div>
            <div id="grab-event" className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
                <button 
                    onClick={toggleGrab}
                    className="grab-event-btn btn btn-sm btn-secondary"
                >
                    {grabLabel}
                </button>
            </div>
        </div>
    );
};

export default EventGrabber;
