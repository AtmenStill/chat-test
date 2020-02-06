# chat-test

Pet project, websockets chat with videocalls


To launch the program in development mode install dependencies and launch "npm run dev"; to launch in production mode use "npm run build" in the "client" folder, and then return to main folder and launch "npm run start".

To call someone press their nickname in "users" list to the left



Known bugs:
React asks for keys when looping through messages
P2P connection won't work because the server isn't https
P2P won't reconnect because of incorrect peer destruction
React Jest conflicts with NodeJS Jest


Future plans:

☼ Add tests to Jest

☼ Add https so that videochat would work in production mode

☼ Add mongoDB to store chat messages

☼ Create video connection for multiple peers

☼ Decomposition\Microservices

☼ React css modules - optional; it works better like this for this small app

☼ Add HOC (ha-ha! Ad-hoc, get it?) - optional, no need for now

☼ Add Redux  - optional, the amount of data going through is negligible

