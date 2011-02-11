from buildbot.status.status_push import StatusPush

import datetime
import logging
import os
import urllib
import urlparse

try:
    import simplejson as json
except ImportError:
    import json

from buildbot.status.base import StatusReceiverMultiService
from buildbot.status.persistent_queue import DiskQueue, IndexedQueue, \
        MemoryQueue, PersistentQueue
from buildbot.status.web.status_json import FilterOut
from twisted.internet import defer, reactor
from twisted.python import log
from twisted.web import client

class CustomStatusPush(StatusPush):
    """Event streamer to a HTTP server."""

    def __init__(self, serverUrl, debug=None, maxMemoryItems=None,
                 maxDiskItems=None, chunkSize=200, maxHttpRequestSize=2**20,
                 **kwargs):
        """
        @serverUrl: Base URL to be used to push events notifications.
        @maxMemoryItems: Maximum number of items to keep queued in memory.
        @maxDiskItems: Maximum number of items to buffer to disk, if 0, doesn't
        use disk at all.
        @debug: Save the json with nice formatting.
        @chunkSize: maximum number of items to send in each at each HTTP POST.
        @maxHttpRequestSize: limits the size of encoded data for AE, the default
        is 1MB.
        """
        # Parameters.
        self.serverUrl = serverUrl
        self.debug = debug
        self.chunkSize = chunkSize
        self.lastPushWasSuccessful = True
        self.maxHttpRequestSize = maxHttpRequestSize
        if maxDiskItems != 0:
            # The queue directory is determined by the server url.
            path = ('events_' +
                    urlparse.urlparse(self.serverUrl)[1].split(':')[0])
            queue = PersistentQueue(
                        primaryQueue=MemoryQueue(maxItems=maxMemoryItems),
                        secondaryQueue=DiskQueue(path, maxItems=maxDiskItems))
        else:
            path = None
            queue = MemoryQueue(maxItems=maxMemoryItems)

        # Use the unbounded method.
        StatusPush.__init__(self, serverPushCb=CustomStatusPush.pushHttp,
                            queue=queue, path=path, **kwargs)

    def wasLastPushSuccessful(self):
        return self.lastPushWasSuccessful

    def popChunk(self):
        """Pops items from the pending list.

        They must be queued back on failure."""
        if self.wasLastPushSuccessful():
            chunkSize = self.chunkSize
        else:
            chunkSize = 1

        start_step_name = "svn" # source.svn step signifies the start
        while True:
            items = self.queue.popChunk(chunkSize)
            # we're only interested in a subset of the starting and ending status updates
            payload = None
            state = None
            for i in items:
                event = i.get("event")
                if event == "buildFinished":
                    state = "finished"
                    payload = i["payload"]["build"]
                    # several k of junk
                    payload.pop("steps")
                    
                elif event == "stepFinished":
                    state = "started"
                    if i["payload"]["step"]["name"] == start_step_name:
                        payload = i["payload"]
          
            if payload is None:
                return (False, items)
            
            stuff = json.dumps(payload, separators=(',',':'))
            data = urllib.urlencode({'state':state, 'payload': stuff})

            if (not self.maxHttpRequestSize or
                len(data) < self.maxHttpRequestSize):
                return (data, items)

            if chunkSize == 1:
                # This packet is just too large. Drop this packet.
                log.msg("ERROR: packet was dropped, too large: %d > %d" %
                        (len(data), self.maxHttpRequestSize))
                chunkSize = self.chunkSize
            else:
                # Try with half the packets.
                chunkSize /= 2
                self.queue.insertBackChunk(items)

    def pushHttp(self):
        """Do the HTTP POST to the server."""
        (encoded_packets, items) = self.popChunk()
        if encoded_packets is False:
            return self.queueNextServerPush()
  

        def Success(result):
            """Queue up next push."""
            log.msg('Sent %d events to %s' % (len(items), self.serverUrl))
            self.lastPushWasSuccessful = True
            return self.queueNextServerPush()

        def Failure(result):
            """Insert back items not sent and queue up next push."""
            # Server is now down.
            log.msg('Failed to push %d events to %s: %s' %
                    (len(items), self.serverUrl, str(result)))
            self.queue.insertBackChunk(items)
            if self.stopped:
                # Bad timing, was being called on shutdown and the server died
                # on us. Make sure the queue is saved since we just queued back
                # items.
                self.queue.save()
            self.lastPushWasSuccessful = False
            return self.queueNextServerPush()

        # Trigger the HTTP POST request.
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        connection = client.getPage(self.serverUrl,
                                    method='POST',
                                    postdata=encoded_packets,
                                    headers=headers,
                                    agent='buildbot')
        connection.addCallbacks(Success, Failure)
        return connection

