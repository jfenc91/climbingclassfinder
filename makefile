run:
	node -e 'require("./handler.js").run()'

getheadless:
	wget https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-53/stable-headless-chromium-amazonlinux-2017-03.zip
	unzip stable-headless-chromium-amazonlinux-2017-03.zip
