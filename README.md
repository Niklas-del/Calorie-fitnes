# FitTrack

A mobile fitness & calorie tracker built with [Expo](https://expo.dev) (React Native + TypeScript).
It runs as a real app on your phone via **Expo Go** — no native build required to try it out.

## Features

- **Calorie target calculator** — onboarding collects sex, age, height, weight, activity level and
  goal (lose / maintain / gain weight, at a chosen kg/week rate), then computes BMR (Mifflin-St Jeor),
  TDEE, a daily calorie target, and macro targets (protein/fat/carbs).
- **Step tracking** — live pedometer via `expo-sensors`, daily step goal, and a 7-day step history chart.
- **Food diary** — log meals (breakfast/lunch/dinner/snack), see calories & macros remaining for the day.
- **Search food by name or barcode** — powered by the free [Open Food Facts](https://world.openfoodfacts.org)
  database (no API key required). Barcode scanning uses the phone camera (`expo-camera`).
- **Photo calorie estimation** — take or pick a meal photo and get an AI-estimated breakdown of items,
  portions and calories (via a vision-capable LLM), with editable results and a manual-entry fallback.
- **Workout builder quiz** — a multiple-choice questionnaire (goal, experience, days/week, equipment,
  focus area, session length) generates a weekly workout split from a built-in exercise database.
  Tap any exercise in the plan to see step-by-step instructions and the muscles it works.
- **Multi-language** — English, German and Polish, switchable in Profile.

## Running on your phone

1. Install dependencies:
   ```
   npm install
   ```
2. Start the dev server:
   ```
   npx expo start
   ```
3. Install the **Expo Go** app on your phone (App Store / Google Play), then scan the QR code shown
   in the terminal (Android: scan from within Expo Go; iOS: scan with the Camera app).

The app will load on your phone with live reload. No Mac or native build tools are needed for this.

## Building an installable .apk

A GitHub Actions workflow (`.github/workflows/build-apk.yml`) builds a real installable Android
`.apk` on every push to `main`, and can also be run on demand:

1. Go to the repo's **Actions** tab → **Build Android APK** → **Run workflow**.
2. Wait for it to finish, then open the run and download the **fittrack-apk** artifact.
3. Unzip it, copy the `.apk` to your Android phone, and open it to install (you'll need to allow
   "install from unknown sources" the first time — this build isn't distributed through the Play
   Store, just self-signed for direct install/testing).

This build runs entirely on GitHub's runners (which have the Android SDK preinstalled) via
`expo prebuild` + a native Gradle build — no Expo account or EAS is required.

**How long it takes:** expect roughly 12-20 minutes. Most of that is one Gradle step compiling the
React Native, Hermes and Reanimated native code from source; a cold run with no Gradle cache is
slow by nature, and reruns are faster once the cache is warm. By default the workflow builds only
the `arm64-v8a` ABI, which every 64-bit Android phone uses — building all four ABIs (the Expo
default) roughly quadruples that native compile step for no benefit on a real phone. To build other
ABIs (e.g. for an x86 emulator), run the workflow manually and set the **architectures** input.

For a Play Store-ready release build (proper signing/versioning) or an iOS `.ipa`, use
[EAS Build](https://docs.expo.dev/build/introduction/) instead once you're ready to ship.

## Languages

The app ships in **English, German and Polish**, switchable under **Profile → Language**; the
choice is saved on-device. English is the fallback for anything untranslated.

To add a language, create `src/i18n/<code>.ts` typed `: Translation` — TypeScript will then list
every key still missing — and register it in `src/i18n/index.ts`. No screen code changes.
Translations cover the whole UI plus all exercise names and instructions (232 keys).

## Photo calorie estimation setup

Photo-based estimation calls a vision-capable LLM directly from the app. Open the **Profile** tab and
paste an Anthropic API key into the "Photo estimation" field — it's stored only in local device storage
and sent directly to Anthropic's API when you estimate a photo. If no key is set, the photo screen falls
back to quick manual entry (name, grams, calories).

> This client-side-key approach is fine for personal use. If you ever ship this to an app store, proxy
> the request through your own backend instead of embedding a key on-device — see
> `src/services/visionCalorie.ts`, which is written as a small swappable module for exactly that.

## Project structure

```
app/                  expo-router screens (file-based routing)
  (tabs)/             bottom tab screens: Today, Diary, Steps, Workout, Profile
  log/                food logging flows: search, barcode scan, photo estimate
  workout/            workout quiz
  profile/            edit profile
  onboarding.tsx       first-run setup

src/
  components/         shared UI (Button, Card, ProgressRing, MacroBar, FoodConfirm)
  data/exercises.ts   exercise database used by the workout generator
  lib/                calorie math, date helpers, workout plan generator, types
  services/           Open Food Facts client, vision (photo) calorie estimator
  store/              zustand stores, persisted to AsyncStorage on-device
  i18n/               en/de/pl translations, useT hook
  theme/               colors/spacing/typography
```

All user data (profile, food log, steps, workout plan, settings) is stored locally on-device via
`@react-native-async-storage/async-storage` — there is no backend/server component.

## Notes & limits

- Step counting uses the phone's built-in pedometer (`expo-sensors`). Historical same-day step counts
  are only available on iOS; on Android/simulators the app tracks steps live from when it's opened.
- Barcode/name lookup quality depends on Open Food Facts' community-maintained database coverage.
- Photo calorie estimates are approximate by nature (as any photo-based estimate would be) — the UI lets
  you adjust calories per detected item before saving.
