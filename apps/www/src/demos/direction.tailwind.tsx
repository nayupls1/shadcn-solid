import { createSignal, For } from "solid-js"
import { Button } from "@shadcn-solid/tailwind/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shadcn-solid/tailwind/ui/card"
import { DirectionProvider, useDirection } from "@shadcn-solid/tailwind/ui/direction"
import { Input } from "@shadcn-solid/tailwind/ui/input"
import { Label } from "@shadcn-solid/tailwind/ui/label"

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
  return <p class="text-xs text-muted-foreground">Current direction: {direction()}</p>
}

export default function DirectionDemo() {
  const [language, setLanguage] = createSignal<Language>("ar")
  const dir = () => translations[language()].dir
  const t = () => translations[language()].values

  return (
    <div class="flex w-full flex-col items-center gap-4">
      <div class="flex gap-1" role="group" aria-label="Language">
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
        <Card class="w-full max-w-sm" dir={dir()}>
          <CardHeader>
            <CardTitle>{t().title}</CardTitle>
            <CardDescription>{t().description}</CardDescription>
            <CardAction>
              <Button variant="link">{t().signUp}</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div class="flex flex-col gap-6">
                <div class="grid gap-2">
                  <Label for="email-rtl">{t().email}</Label>
                  <Input id="email-rtl" type="email" placeholder={t().emailPlaceholder} required />
                </div>
                <div class="grid gap-2">
                  <div class="flex items-center">
                    <Label for="password-rtl">{t().password}</Label>
                    <a href="#" class="ms-auto inline-block text-sm underline-offset-4 hover:underline">
                      {t().forgotPassword}
                    </a>
                  </div>
                  <Input id="password-rtl" type="password" required />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter class="flex-col gap-2">
            <Button type="submit" class="w-full">
              {t().login}
            </Button>
            <Button variant="outline" class="w-full">
              {t().loginWithGoogle}
            </Button>
            <CurrentDirection />
          </CardFooter>
        </Card>
      </DirectionProvider>
    </div>
  )
}
