from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = "7776728442:AAFmS9_PAyA7xw3q9xM1utxB6vKiGDxEbmM"  # Вставьте токен бота
MINI_APP_URL = "https://tgambling.vercel.app"  # Убедитесь, что ссылка начинается с https://

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Напиши /gamble чтобы играть.")

async def gamble(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = {
        "inline_keyboard": [[{"text": "ИГРАТЬ!", "web_app": {"url": MINI_APP_URL}}]]
    }
    await update.message.reply_text("ВЫИГРАЙ СОСТОЯНИЕ", reply_markup=keyboard)

def main():
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("gamble", gamble))
    application.run_polling()

if __name__ == "__main__":
    main()