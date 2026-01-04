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
      let isClosed = false;
      let heartbeatInterval: NodeJS.Timeout | null = null;
      let eventHandler: ((payload: any) => void) | null = null;

      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        if (eventHandler) {
          emitter.off('order.updated', eventHandler);
          eventHandler = null;
        }
      };

      const send = (event: string, data: any) => {
        if (isClosed) return;
        try {
          const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(payload));
        } catch (error) {
          // Controller is closed, cleanup
          cleanup();
        }
      };

      // Initial heartbeat
      send('connected', { ok: true });

      eventHandler = (payload: any) => {
        if (isClosed) return;
        if (!payload || payload.restaurantId !== auth.restaurantId) return;
        send('order.updated', payload);
      };

      emitter.on('order.updated', eventHandler);

      heartbeatInterval = setInterval(() => {
        if (!isClosed) {
          send('ping', { t: Date.now() });
        } else {
          cleanup();
        }
      }, 25000);

      // Store cleanup in a way cancel can access (though cancel has limited access)
      // Cleanup will be called automatically on errors via the catch block
    },
    cancel() {
      // Cleanup is handled automatically when send() throws errors
      // The isClosed flag and cleanup in send() catch block handles this
    }
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


