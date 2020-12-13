# Super simple discord starboard

## Installation

Start by cloning the repo and installing the dependencies
```
$ git clone https://github.com/SimonLeclere/super-simple-starboard.git
$ npm i
```

Then you can fill the config object at the beginning of the index.js file with your values.
```
const settings = {
	token: '5UP3R-53CR3T-T0K3N', // Your discord bot token
	channel: '787371140255318036', // Starboard channel id
	emoji: '⭐' // React emoji
}
```

Finally, start the bot with `npm start`!

## Credits

This repo is based on [this tutorial](https://anidiots.guide/coding-guides/making-your-own-starboard) from An Idiot's Guide.