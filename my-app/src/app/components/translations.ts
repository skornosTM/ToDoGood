// ============================================================
// Translations for legacy app (auth + settings)
// ============================================================

export type Language = "ru" | "en";

export const legacyTranslations: Record<Language, Record<string, string>> = {
  ru: {
    // Auth
    auth_title: "АВТОРИЗАЦИЯ",
    auth_register_title: "РЕГИСТРАЦИЯ",
    auth_nickname: "Nickname",
    auth_password: "Password",
    auth_login_btn: "Авторизироваться",
    auth_register_btn: "Зарегистрироваться",
    auth_no_account: "Нет аккаунта, создай!",
    auth_has_account: "Авторизация",
    auth_register_hint: "Введите эмодзи аватарки",
    auth_error_empty: "Заполните ник и пароль",
    auth_error_duplicate: "Такой ник уже занят",
    auth_error_wrong: "Неверный ник или пароль",
    // Language prompt
    lang_prompt_title: "Выберите язык",
    lang_prompt_question: "Каким языком вы пользуетесь?",
    lang_russian: "Русский",
    lang_english: "English",
    lang_skip: "Пропустить",
    lang_continue: "Продолжить",
  },
  en: {
    auth_title: "AUTHORIZATION",
    auth_register_title: "REGISTRATION",
    auth_nickname: "Nickname",
    auth_password: "Password",
    auth_login_btn: "Log In",
    auth_register_btn: "Sign Up",
    auth_no_account: "No account? Create one!",
    auth_has_account: "Log In",
    auth_register_hint: "Enter emoji avatar",
    auth_error_empty: "Fill in nickname and password",
    auth_error_duplicate: "This nickname is already taken",
    auth_error_wrong: "Wrong nickname or password",
    lang_prompt_title: "Choose Language",
    lang_prompt_question: "Which language do you use?",
    lang_russian: "Russian",
    lang_english: "English",
    lang_skip: "Skip",
    lang_continue: "Continue",
  },
};

export function lt(key: string, lang: Language): string {
  return legacyTranslations[lang]?.[key] ?? legacyTranslations.ru[key] ?? key;
}
