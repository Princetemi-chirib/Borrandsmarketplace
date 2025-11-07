import { NextRequest } from 'next/server';
import emitter from '@/lib/services/events';
import { verifyAppRequest, verifyAppTokenString } from '@/lib/auth-app';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const auth = token ? verifyAppTokenString(token) : verifyAppRequest(request);
  if (!auth || auth.role !== 'RESTAURANT' || !auth.restaurantId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: any) => {
        const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
      };

      // Initial heartbeat
      send('connected', { ok: true });

      const handler = (payload: any) => {
        if (!payload || payload.restaurantId !== auth.restaurantId) return;
        send('order.updated', payload);
      };

      emitter.on('order.updated', handler);

      const heartbeat = setInterval(() => send('ping', { t: Date.now() }), 25000);

      controller.enqueue(new TextEncoder().encode(': connected\n\n'));

      return () => {
        clearInterval(heartbeat);
        emitter.off('order.updated', handler);
      };
    },
    cancel() {}
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}


