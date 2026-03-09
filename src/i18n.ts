import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "JINN",
      "slogan": "Your Wish Lamp",
      "my_lists": "My Lists",
      "explore": "Explore",
      "how_it_works": "How it works",
      "add_wish": "Add Wish",
      "share": "Share",
      "ninja_mode": "Ninja Mode",
      "ninja_on": "ON",
      "ninja_off": "OFF",
      "all_wishes": "All Wishes",
      "available": "Available",
      "group_gifts": "Group Gifts",
      "reserved": "Reserved",
      "total_price": "Total Price",
      "raised": "Raised",
      "contribute": "Contribute",
      "gift_now": "Gift Now",
      "accomplice_wall": "Genie Wall",
      "write_message": "Write a message...",
      "be_first_comment": "Be the first to comment!",
      "points": "pts",
      "mood_prefix": "Mood:",
      "created_by": "Created by",
      "settings": "Settings",
      "language": "Language",
      "currency": "Currency",
      "save": "Save",
      "close": "Close",
      "link_copied": "Link copied to clipboard!",
      "archived_lists": "Archived Lists",
      "invitation_copied": "Invitation Copied!",
      "share_success_msg": "The link for the list \"{{title}}\" by {{creator}} is ready to share.",
      "invitation_text": "Hi! I invite you to participate in the wishlist \"{{title}}\" by {{creator}}. 🧞✨\n\nEnter here: {{url}}\nOr use the magic code: {{code}}",
      "ok_got_it": "OK, Got it!",
      "payment_methods": "Payment Methods",
      "add_payment_method": "Add Payment Method",
      "manage_payments": "Manage Accounts & Cards",
      "payment_config_title": "Configure Payments",
      "payment_config_desc": "Indicate how you want to receive contributions. Jinn does not handle the money, it only facilitates the direct link with your genies.",
      "payment_type_paypal": "PayPal",
      "payment_type_mercadopago": "Mercado Pago",
      "payment_type_bank": "Bank / Transfer",
      "payment_type_debit": "Debit Card",
      "payment_type_other": "Other",
      "payment_method_name_placeholder": "Method name (e.g., My Bank Account)",
      "payment_details_placeholder": "Details (CBU, Alias, Payment Link, etc.)",
      "cancel": "Cancel",
      "save_method": "Save Method",
      "save_all_changes": "Save All Changes"
    }
  },
  es: {
    translation: {
      "app_name": "JINN",
      "slogan": "Tu Lámpara de Deseos",
      "my_lists": "Mis Listas",
      "explore": "Explorar",
      "how_it_works": "Cómo funciona",
      "add_wish": "Añadir Deseo",
      "share": "Compartir",
      "ninja_mode": "Modo Ninja",
      "ninja_on": "ACTIVADO",
      "ninja_off": "DESACTIVADO",
      "all_wishes": "Todos los Deseos",
      "available": "Disponibles",
      "group_gifts": "Regalos Colectivos",
      "reserved": "Ya Reservados",
      "total_price": "Precio Total",
      "raised": "Recaudado",
      "contribute": "Contribuir",
      "gift_now": "Regalar Ahora",
      "accomplice_wall": "Muro de Genios",
      "write_message": "Escribe un mensaje...",
      "be_first_comment": "¡Sé el primero en comentar!",
      "points": "pts",
      "mood_prefix": "Mood:",
      "created_by": "Creado por",
      "settings": "Ajustes",
      "language": "Idioma",
      "currency": "Moneda",
      "save": "Guardar",
      "close": "Cerrar",
      "link_copied": "¡Enlace copiado al portapapeles!",
      "archived_lists": "Listas Archivadas",
      "invitation_copied": "¡Invitación Copiada!",
      "share_success_msg": "El enlace de la lista \"{{title}}\" de {{creator}} ya está listo para compartir.",
      "invitation_text": "¡Hola! Te invito a participar en la lista de deseos \"{{title}}\" de {{creator}}. 🧞✨\n\nEntra aquí: {{url}}\nOr usa el código mágico: {{code}}",
      "ok_got_it": "¡Entendido!",
      "payment_methods": "Métodos de Pago",
      "add_payment_method": "Añadir Método de Pago",
      "manage_payments": "Gestionar Cuentas y Tarjetas",
      "payment_config_title": "Configurar Pagos",
      "payment_config_desc": "Indica cómo quieres recibir las contribuciones. Jinn no maneja el dinero, solo facilita el vínculo directo con tus genios.",
      "payment_type_paypal": "PayPal",
      "payment_type_mercadopago": "Mercado Pago",
      "payment_type_bank": "Banco / Transferencia",
      "payment_type_debit": "Tarjeta de Débito",
      "payment_type_other": "Otro",
      "payment_method_name_placeholder": "Nombre del método (ej: Mi CBU Santander)",
      "payment_details_placeholder": "Detalles (CBU, Alias, Link de Pago, etc.)",
      "cancel": "Cancelar",
      "save_method": "Guardar Método",
      "save_all_changes": "Guardar Todos los Cambios"
    }
  },
  pt: {
    translation: {
      "app_name": "JINN",
      "slogan": "Sua Lâmpada de Desejos",
      "my_lists": "Minhas Listas",
      "explore": "Explorar",
      "how_it_works": "Como funciona",
      "add_wish": "Adicionar Desejo",
      "share": "Compartilhar",
      "ninja_mode": "Modo Ninja",
      "settings": "Configurações",
      "language": "Idioma",
      "currency": "Moeda",
      "save": "Salvar",
      "close": "Fechar"
    }
  },
  fr: {
    translation: {
      "app_name": "JINN",
      "slogan": "Votre Lampe à Souhaits",
      "my_lists": "Mes Listes",
      "explore": "Explorer",
      "how_it_works": "Comment ça marche",
      "add_wish": "Ajouter un Souhait",
      "share": "Partager",
      "ninja_mode": "Mode Ninja",
      "settings": "Paramètres",
      "language": "Langue",
      "currency": "Devise",
      "save": "Enregistrer",
      "close": "Fermer"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
