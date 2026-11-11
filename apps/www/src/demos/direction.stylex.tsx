import { createSignal, For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@shadcn-solid/stylex/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shadcn-solid/stylex/ui/card"
import { DirectionProvider, useDirection } from "@shadcn-solid/stylex/ui/direction"
import { Input } from "@shadcn-solid/stylex/ui/input"
import { Label } from "@shadcn-solid/stylex/ui/label"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"

// shadcn's direction docs preview (`card-rtl`): the login card in English, Arabic and Hebrew.
const translations = {
  en: {
    label: "English",
    dir: "ltr",
    values: {
      title: "Login to your account",
      description: "Enter your email below to login to your account",
      signUp: "Sign Up",
      email: "Email",
      emailPlaceholder: "m@example.com",
      password: "Password",
      forgotPassword: "Forgot your password?",
      login: "Login",
      loginWithGoogle: "Login with Google",
    },
  },
  ar: {
    label: "العربية",
    dir: "rtl",
    values: {
      title: "تسجيل الدخول إلى حسابك",
      description: "أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك",
      signUp: "إنشاء حساب",
      email: "البريد الإلكتروني",
      emailPlaceholder: "m@example.com",
      password: "كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      login: "تسجيل الدخول",
      loginWithGoogle: "تسجيل الدخول باستخدام Google",
    },
  },
  he: {
    label: "עברית",
    dir: "rtl",
    values: {
      title: "התחבר לחשבון שלך",
      description: "הזן את האימייל שלך למטה כדי להתחבר לחשבון שלך",
      signUp: "הירשם",
      email: "אימייל",
      emailPlaceholder: "m@example.com",
      password: "סיסמה",
      forgotPassword: "שכחת את הסיסמה?",
      login: "התחבר",
      loginWithGoogle: "התחבר עם Google",
    },
  },
} as const

type Language = keyof typeof translations

function CurrentDirection() {
  const direction = useDirection()
  return <p {...stylex.attrs(styles.current)}>Current direction: {direction()}</p>
}

export default function DirectionDemo() {
  const [language, setLanguage] = createSignal<Language>("ar")
  const dir = () => translations[language()].dir
  const t = () => translations[language()].values

  return (
    <div {...stylex.attrs(styles.root)}>
      <div {...stylex.attrs(styles.languages)} role="group" aria-label="Language">
        <For each={Object.keys(translations) as Language[]}>
          {(lang) => (
            <Button
              size="sm"
              variant={language() === lang ? "secondary" : "ghost"}
              aria-pressed={language() === lang ? "true" : "false"}
              onClick={() => {
                setLanguage(lang)
              }}
            >
              {translations[lang].label}
            </Button>
          )}
        </For>
      </div>
      <DirectionProvider direction={dir()}>
        <Card xstyle={styles.card} dir={dir()}>
          <CardHeader>
            <CardTitle>{t().title}</CardTitle>
            <CardDescription>{t().description}</CardDescription>
            <CardAction>
              <Button variant="link">{t().signUp}</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div {...stylex.attrs(styles.fields)}>
                <div {...stylex.attrs(styles.field)}>
                  <Label for="email-rtl-sx">{t().email}</Label>
                  <Input id="email-rtl-sx" type="email" placeholder={t().emailPlaceholder} required />
                </div>
                <div {...stylex.attrs(styles.field)}>
                  <div {...stylex.attrs(styles.labelRow)}>
                    <Label for="password-rtl-sx">{t().password}</Label>
                    <a href="#" {...stylex.attrs(styles.forgot)}>
                      {t().forgotPassword}
                    </a>
                  </div>
                  <Input id="password-rtl-sx" type="password" required />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter xstyle={styles.footer}>
            <Button type="submit" xstyle={styles.fullWidth}>
              {t().login}
            </Button>
            <Button variant="outline" xstyle={styles.fullWidth}>
              {t().loginWithGoogle}
            </Button>
            <CurrentDirection />
          </CardFooter>
        </Card>
      </DirectionProvider>
    </div>
  )
}

const styles = stylex.create({
  root: { display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: "1rem" },
  languages: { display: "flex", gap: "0.25rem" },
  card: { width: "100%", maxWidth: "24rem" },
  fields: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  field: { display: "grid", gap: "0.5rem" },
  labelRow: { display: "flex", alignItems: "center" },
  forgot: {
    marginInlineStart: "auto",
    display: "inline-block",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textUnderlineOffset: "4px",
    textDecorationLine: { default: null, ":hover": "underline" },
  },
  footer: { flexDirection: "column", gap: "0.5rem" },
  fullWidth: { width: "100%" },
  current: { fontSize: "0.75rem", lineHeight: "1rem", color: colors.mutedForeground },
})
