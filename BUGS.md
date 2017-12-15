## BUGS AND KNOWN ISSUES

* There is no db cleanup function, so the redis db may fill your memory and stop working. You should be fine for a about an year if you have a GB of memory though. If you think the bot's going to fill the memory occasionally 'flushdb' your redis db.

* There is no auto-shutdown function if the program encounters a string of losses. This is something that is usually included in most bots

* Doesn't have proper logging right now, use the logging ability that comes with forever

* And probably more that I don't know of.

* Future versions will include a test suite (I hope).
