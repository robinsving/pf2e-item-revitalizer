import { id as SCRIPT_ID } from "../module.json";

export function debug(message) {
    console.debug(`${SCRIPT_ID}: ${message}`)
}

export function info(message) {
    console.info(`${SCRIPT_ID}: ${message}`)
}