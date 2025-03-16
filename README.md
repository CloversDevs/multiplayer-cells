# multiplayer-cells
A nakama multiplayer game

## Launching server
Open Server folder on terminal and run:

```docker-compose down && docker-compose up -d --build && docker-compose logs -f```

To connect use the IP on port 3000 on a browser.
For example [http://localhost:3000](http://localhost:3000)

## Stoping server
To stop server gracefully run:

```docker-compose down```
