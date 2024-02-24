// Chrome notification api - component
// https://developer.mozilla.org/en-US/docs/Web/API/notification

import React from 'react';
import { useState } from "react";
import { Button } from "react-bootstrap";

const Notification = (props) => {
    const [notification, setNotification] = useState(null);
    const [title, setTitle] = useState(props.title);
    const [body, setBody] = useState(props.body);
    const [icon, setIcon] = useState(props.icon);
    const [tag, setTag] = useState(props.tag);
    const [action, setAction] = useState(props.action);
    const [close, setClose] = useState(props.close);
    const [requireInteraction, setRequireInteraction] = useState(props.requireInteraction);
    const [silent, setSilent] = useState(props.silent);
    const [vibrate, setVibrate] = useState(props.vibrate);
    const [dir, setDir] = useState(props.dir);
    const [lang, setLang] = useState(props.lang);
    const [timestamp, setTimestamp] = useState(props.timestamp);
    const [renotify, setRenotify] = useState(props.renotify);
    const [data, setData] = useState(props.data);

    const showNotification = () => {
        if (Notification.permission === 'granted') {
            const options = {
                body: body,
                icon: icon,
                tag: tag,
                action: action,
                close: close,
                requireInteraction: requireInteraction,
                silent: silent,
                vibrate: vibrate,
                dir: dir,
                lang: lang,
                timestamp: timestamp,
                renotify: renotify,
                silent: silent,
                data: data
            }
            const n = new Notification(title, options);
            setNotification(n);
        }
    }

    const requestPermission = () => {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                showNotification();
            }
        });
    }

    const closeNotification = () => {
        notification.close();
    }

    return (
        <div>
            <Button onClick={requestPermission}>Show Notification</Button>
            <Button onClick={closeNotification}>Close Notification</Button>
        </div>
    );
}

export default Notification;