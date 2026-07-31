import React, { useState, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BookOpen, Moon, Heart, Sparkles } from "lucide-react-native"
import { markOnboardingCompleted } from "@/shared/lib/onboarding"
import { useAppTheme } from "@/hooks/useAppTheme"
import type { ThemeTokens } from "@/shared/theme"

const { width } = Dimensions.get("window")

interface Slide {
  icon: React.ComponentType<{ size: number; color: string }>
  title: string
  body: string
  gradientColors: [string, string]
  iconColor: string
}

function getSlides(theme: ThemeTokens): Slide[] {
  return [
    {
      icon: BookOpen,
      title: "Tu biblioteca, siempre contigo",
      body: "Sube tus libros PDF y llévalos a todas partes. Tu colección personal, en tu bolsillo.",
      gradientColors: [theme.secondary, theme.third],
      iconColor: theme.secondary,
    },
    {
      icon: Moon,
      title: "Lee sin límites",
      body: "Personaliza tu experiencia con múltiples temas, ajusta el tamaño de letra y disfruta de una lectura placentera.",
      gradientColors: [theme.third, theme.altern],
      iconColor: theme.fontColorTitle,
    },
    {
      icon: Heart,
      title: "Progreso sincronizado",
      body: "Guarda tus marcadores, resalta tus pasajes favoritos y sincroniza todo con la nube.",
      gradientColors: [theme.altern, theme.secondary],
      iconColor: theme.secondary,
    },
    {
      icon: Sparkles,
      title: "Tu aventura comienza aquí",
      body: "Descubre una nueva forma de leer. Organiza, personaliza y disfruta cada página.",
      gradientColors: [theme.secondary, theme.third],
      iconColor: theme.fontColorTitle,
    },
  ]
}

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme } = useAppTheme()
  const slides = getSlides(theme)

  const [currentIndex, setCurrentIndex] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  const isFirst = currentIndex === 0
  const isLast = currentIndex === slides.length - 1

  const animateToSlide = useCallback(
    (nextIndex: number) => {
      const goingForward = nextIndex > currentIndex
      const outValue = goingForward ? -width * 0.3 : width * 0.3
      const inFrom = goingForward ? width * 0.3 : -width * 0.3

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: outValue,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(nextIndex)
        fadeAnim.setValue(0)
        slideAnim.setValue(inFrom)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 60,
            useNativeDriver: true,
          }),
        ]).start()
      })
    },
    [currentIndex, fadeAnim, slideAnim],
  )

  const handleNext = useCallback(async () => {
    if (isLast) {
      await markOnboardingCompleted()
      router.replace("/(auth)/register")
    } else {
      animateToSlide(currentIndex + 1)
    }
  }, [isLast, currentIndex, animateToSlide, router])

  const handleBack = useCallback(() => {
    if (currentIndex > 0) animateToSlide(currentIndex - 1)
  }, [currentIndex, animateToSlide])

  const handleSkip = useCallback(async () => {
    await markOnboardingCompleted()
    router.replace("/(auth)/register")
  }, [router])

  const s = slides[currentIndex]
  const IconComponent = s.icon
  const iconColor = s.iconColor

  const styles = makeStyles(theme, insets)

  return (
    <View style={styles.root}>
      {/* Top bar: Back arrow + Skip */}
      <View style={styles.topBar}>
        {!isFirst && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}

        <View style={styles.topBarSpacer} />

        <TouchableOpacity activeOpacity={0.7} onPress={handleSkip}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Gradient circle */}
        <Animated.View
          style={[
            styles.circleShadow,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <LinearGradient colors={s.gradientColors} style={styles.circle}>
            <IconComponent size={56} color={iconColor} />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {s.title}
        </Animated.Text>

        {/* Body */}
        <Animated.Text
          style={[
            styles.body,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {s.body}
        </Animated.Text>
      </View>

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {slides.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.7}
            onPress={() => {
              if (idx !== currentIndex) animateToSlide(idx)
            }}
            style={[
              styles.dot,
              idx === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
            accessibilityLabel={`Slide ${idx + 1}`}
          />
        ))}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        {/* Next / Start button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? "Comenzar" : "Siguiente"}
          </Text>
          {!isLast && (
            <Text style={styles.arrowRight}> →</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(auth)/login")}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.loginTextBold}>Iniciar sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function makeStyles(theme: ThemeTokens, insets: { top: number; bottom: number }) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.primary,
    },
    topBar: {
      position: "absolute",
      top: insets.top + 12,
      left: 20,
      right: 20,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    topBarSpacer: {
      flex: 1,
    },
    backArrow: {
      fontSize: 22,
      color: theme.fontColorText,
    },
    skipText: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.fontColorText,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    circleShadow: {
      marginBottom: 28,
      borderRadius: 5,
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 30,
      elevation: 12,
    },
    circle: {
      width: 200,
      height: 200,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.fontColorTitle,
      textAlign: "center",
      marginBottom: 14,
      lineHeight: 32,
    },
    body: {
      fontSize: 15,
      color: theme.fontColorText,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
    },
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 24,
    },
    dot: {
      height: 8,
      borderRadius: 5,
    },
    dotActive: {
      width: 32,
      backgroundColor: theme.secondary,
    },
    dotInactive: {
      width: 8,
      backgroundColor: theme.border,
    },
    bottomActions: {
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 24,
      gap: 14,
    },
    nextButton: {
      minHeight: 52,
      backgroundColor: theme.secondary,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    nextButtonText: {
      fontSize: 17,
      fontWeight: "600",
      color: "#ffffff",
    },
    arrowRight: {
      fontSize: 17,
      fontWeight: "600",
      color: "#ffffff",
    },
    loginLink: {
      alignItems: "center",
      paddingVertical: 8,
    },
    loginText: {
      fontSize: 14,
      color: theme.fontColorText,
    },
    loginTextBold: {
      fontWeight: "600",
      color: theme.secondary,
    },
  })
}
