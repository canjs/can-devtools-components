import { domEvents, enterEvent } from "can";

// add this one place so that this module can be imported
// by whatever wants to use the `enter` event without
// causing `Event "enter" is already registered` errors
domEvents.addEvent(enterEvent);
