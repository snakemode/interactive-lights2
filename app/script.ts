import Ably from "ably";
import { ClickableGrid } from "./js/ClickableGrid";
import { ColorPallette } from "./js/ColorPallette";
import { default as RemoteMatrixLedDriver, ArduinoDeviceAdapter, AblyTransport } from "@snakemode/matrix-driver";
import { PixelProtocolMessageHandler } from "./js/PixelProtocolMessageHandler";

(async () => {

    console.log("Oh hai! 🖤");

    const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });

    const channelName = "tshirt";
    const deviceDimensions = { width: 16, height: 16 };

    const ledDriver = new RemoteMatrixLedDriver({
        displayConfig: deviceDimensions,
        deviceAdapter: new ArduinoDeviceAdapter(new AblyTransport(ably, channelName))
    });

    const colorPicker = new ColorPallette("color");
    const clickableGrid = new ClickableGrid("pixels", deviceDimensions);
    const inboundMessageHandler = new PixelProtocolMessageHandler(clickableGrid);

    clickableGrid.onClick((x, y) => { ledDriver.pixel.set({ x: x, y: y, color: colorPicker.activeColor }); });
    clickableGrid.draw();

    const channel = ably.channels.get(channelName, { params: { rewind: "2m" } } as any); // Includes history
    await channel.attach();
    channel.subscribe(m => { inboundMessageHandler.handle(m); });

})();