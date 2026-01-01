import { EventEmitter } from 'events';

class GlobalEmitter extends EventEmitter {}

// Singleton emitter across hot reloads
const g = global as any;
const emitter: EventEmitter = g.__GLOBAL_EVENT_EMITTER__ || new GlobalEmitter();
if (!g.__GLOBAL_EVENT_EMITTER__) {
  g.__GLOBAL_EVENT_EMITTER__ = emitter;
}

export default emitter;


















