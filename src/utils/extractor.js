export const extractWhatsAppData = (body) => {
  try {
    const value = body.entry?.[0]?.changes?.[0]?.value;

    // 🔥 ignorar si no hay mensaje

    if (!value?.messages) return null;
    const message = value.messages[0];
    const contact = value.contacts?.[0];
    const text = message.text?.body;
    const button = message?.interactive?.button_reply?.id;
    const list = message?.interactive?.list_reply?.id;
    return {
      from: message.from,
      messageId: message.id,
      input: button || list || text,
      name: contact?.profile?.name || "",
      phoneNumberId: value.metadata?.phone_number_id,
    };
  } catch (error) {
    console.error("Error extracting data:", error);
    return null;
  }
};