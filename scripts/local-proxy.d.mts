import type { IncomingMessage, ServerResponse } from 'node:http';
export function localHost(host: string): boolean;
export function localApiProxy(base?: string): (req: IncomingMessage, res: ServerResponse, next: () => void) => void;