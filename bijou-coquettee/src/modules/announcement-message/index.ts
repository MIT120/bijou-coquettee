import { Module } from "@medusajs/framework/utils"
import AnnouncementMessageModuleService from "./service"

export const ANNOUNCEMENT_MESSAGE_MODULE = "announcementMessageModuleService"

export default Module(ANNOUNCEMENT_MESSAGE_MODULE, {
    service: AnnouncementMessageModuleService,
})
