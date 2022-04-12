# Minecraft Server Control Discord Bot

This bot uses [MSCS](https://github.com/MinecraftServerControl/mscs/) to control multiple Minecraft servers (henceforth referred to as worlds) running on the same system via Discord using Slash commands.

Currently, a Discord server has exactly one world attached to it, but a world can have multiple Discord servers. This might get changed in the future to allow a Discord server to control multiple worlds.

## Features
- Starting, restarting or stopping a world
- Viewing the logs of a world directly in Discord
- Querying the status of a world
- Displaying the world status via Discord presence (online or idle)
- Locking worlds to prevent them from being started
- Log every command sent to the bot


## TODOs
- Expand locking to optionally work per-world
- Tie the ability of using commands to having a role
- Improved, more detailed and more verbose logs, split them per world
- Add a 'sub'-mode that can be deployed on a remote server, controlled by the main node that runs the bot
- ...

## Usage
- Set up your [MSCS](https://github.com/MinecraftServerControl/mscs/) installation
- Create a Discord application and a bot for it
- Edit the .env.example file with your IDs, tokens and world names, and rename it to .env
- Run `node deployment/deploy-commands.js` once to register the Slash commands with Discord
- Start the server as the user created by MSCS (default `minecraft`): `sudo -u minecraft index.js`
- Optional: Use a Process Manager like `pm2` to keep the process running in the background