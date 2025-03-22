# multiplayer-cells
A nakama multiplayer game

## Launching server
### Set up the build enviroment

Open Server folder, copy .env.example into .env changing the values (important for security).

Copy the value of the .env variable ```'NAKAMA_SOCKET_SERVER_KEY'``` into ```./node-js/client/src/publicKeys.ts```
or use the provided script in the Server folder.

```
chmod +x apply_keys.sh
./apply_keys.sh NAKAMA_SESSION_ENCRYPTION_KEY ./node-js/client/src/publicKeys.ts
```

Open Server folder on terminal and run:

```docker-compose down && docker-compose up -d --build && docker-compose logs -f```

To connect use the IP on port 3000 on a browser.
For example [http://localhost:3000](http://localhost:3000)

## Stoping server
To stop server gracefully run:

```docker-compose down```

## Deleting the server
To delete the server volumes (WARNING: deletes all unused docker volumes on the machine):

```docker-compose down && docker volume prune```
