import { Module } from "@medusajs/framework/utils"
import CertificateModuleService from "./service"

export const CERTIFICATE_MODULE = "certificateModuleService"

export default Module(CERTIFICATE_MODULE, {
    service: CertificateModuleService,
})
