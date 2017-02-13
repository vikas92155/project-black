import os
import asyncio
import aioredis
from time import sleep

from concurrent.futures._base import TimeoutError

from asyncio.subprocess import PIPE


class Worker(object):

    """Worker keeps track of new tasks on the redis channel and 
    launches them in the background.
    Another redis channel is monitored for all notifications.
    If any, process them ASAP."""

    def __init__(self):
        # Channel (queue) for receiving tasks
        self.tasks_channel = None

        # Channel (queue) for receiving notifications
        self.notifications_channel = None

        # List of actively running processes
        self.active_processes = list()

        # List of finished processes
        self.finished_processes = list()

    async def initialize(self):
        """ Init variables and run queues checkers """
        # Create connect to redis
        connection = await aioredis.create_redis(('localhost', 6379))

        # Subscribe to the channel 'nmap_tasks'
        subscription_result = await connection.psubscribe('nmap_tasks')

        # Remember the channel
        self.tasks_channel = subscription_result[0]

        # Subscribe to the channel 'nmap_notifications'
        subscription_result = await connection.psubscribe('nmap_notifications')

        # Remember the channel
        self.notifications_channel = subscription_result[0]

    async def process_tasks_queue(self):
        """ Check if tasks queue has any data. 
        If any, launch the tasks execution """
        try:
            # Try to read data from queue with a timeout
            msg = await asyncio.wait_for(self.tasks_channel.get_json(), 1)
        except TimeoutError as e:
            print("[Task] Timeout")
        else:
            await self.start_task(msg)

    async def process_notifications_queue(self):
        """ Check if notifications queue has any data.
        If any, launch the notifications execution """
        try:
            # Try to read data from queue with a timeout
            msg = await asyncio.wait_for(self.notifications_channel.get_json(), 1)
        except TimeoutError as e:
            print("[Notif] Timeout")
        else:
            await self.start_notifications(msg)

    async def update_active_processes(self):
        """ Check all the running processes and see if any has finished(terminated) """
        # Remember, which processes should be removed from the list of active processes
        to_remove = list()

        for i in range(0, len(self.active_processes)):
            tag = self.active_processes[i]['tag']
            proc = self.active_processes[i]['process']
            try:
                # Give 0.1s for a check that a process has exited
                (stdout, stderr) = await asyncio.wait_for(proc.communicate(), 0.1)
            except TimeoutError as e:
                # Not yet finished
                print("[Task][Poll] Timeout")
            else:
                # The process have exited.
                # Grab the exit code of the process
                exit_code = await proc.wait()

                # For now leave these prints
                print("[Task][Poll] Finished")
                print(stdout, stderr)
                print(exit_code)

                # Save the data about the process, so we can grab it next time
                # or serialize and save locally
                self.finished_processes.append({
                    "tag": tag,
                    "stdout": stdout,
                    "stderr": stderr,
                    "exit_code": exit_code,
                    "status": "finished" if exit_code == 0 else "terminated"
                })
                to_remove.append(i)

        # Remove finished/terminated tasks from the list of active tasks
        if to_remove:
            for i in reversed(to_remove):
                self.active_processes.pop(i)

    async def process_queues(self):
        """ Infinite loop for processing both queues """
        # Check that we have not exceeded the limit
        if len(self.active_processes) < 3:
            await self.process_tasks_queue()
        else:
            print("Too many processes have been run at this time")

        # Check the notifications queue
        await self.process_notifications_queue()

        # Update processes list
        await self.update_active_processes()

        # Infinite loop
        await self.process_queues()

    async def start_task(self, message):
        """ Method launches the task execution, remembering the 
            processes's object. """

        # Add a unique tag to the task, so we can track the notifications 
        # which are addressed to the ceratin task
        message = message[1]
        task_tag = message['tag']
        command = message['command']

        # Spawn the process
        proc = await asyncio.create_subprocess_shell(command,
                                                     stdout=PIPE, stderr=PIPE)

        # Store the object that points to the process
        self.active_processes.append({
            "tag": task_tag, 
            "process": proc,
            "command": command
        })
        # print("YEEEE LOGGER") 

    async def start_notification(self, command):
        """ Method launches the notification execution, remembering the 
            processes's object. """
        print("YEEEE LOGGER")


loop = asyncio.get_event_loop()
worker = Worker()
loop.run_until_complete(worker.initialize())
loop.run_until_complete(worker.process_queues())
