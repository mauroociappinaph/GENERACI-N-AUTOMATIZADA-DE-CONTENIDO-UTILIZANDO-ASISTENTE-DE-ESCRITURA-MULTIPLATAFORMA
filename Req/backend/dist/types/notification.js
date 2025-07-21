"use strict";
/**
 * Tipos para el sistema de notificaciones en tiempo real
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "info";
    NotificationType["SUCCESS"] = "success";
    NotificationType["WARNING"] = "warning";
    NotificationType["ERROR"] = "error";
    NotificationType["SYSTEM"] = "system";
    NotificationType["USER_ACTION"] = "user_action";
    NotificationType["DATA_UPDATE"] = "data_update";
    NotificationType["REPORT_READY"] = "report_ready";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
