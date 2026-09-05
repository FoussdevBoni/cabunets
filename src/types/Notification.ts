import { BackendData } from "./core/BackendData";

export interface BaseNotification {
    title: string;
    receivers?: string[];
    type: "general" | "private" | "whatsapp";
    body: string;
    attachments?: string[];
    readBy: string[];
    whatsappSent: boolean;
    whatsappSentAt?: Date;
}

export interface Notification extends BackendData , BaseNotification {

}