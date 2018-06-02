import { ipcMain } from "electron";
import { openImage, getColor } from "main/handler";
import { OPEN_IMAGE, GET_COLOR } from "common/channel";

ipcMain.on(OPEN_IMAGE, openImage);
ipcMain.on(GET_COLOR, getColor);
