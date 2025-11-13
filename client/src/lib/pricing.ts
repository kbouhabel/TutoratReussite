export interface PricingConfig {
  grade: "primaire" | "secondaire";
  duration: "1h" | "1h30" | "2h";
  location: "teacher" | "home" | "online";
}

export function calculatePrice(config: PricingConfig): number {
  const { grade, duration, location } = config;

  const pricing = {
    primaire: {
      teacher: { "1h": 35, "1h30": 50, "2h": 65 },
      home: { "1h": 40, "1h30": 60, "2h": 80 },
      online: { "1h": 35, "1h30": 50, "2h": 65 }, // Même tarif que "teacher"
    },
    secondaire: {
      teacher: { "1h": 40, "1h30": 55, "2h": 70 },
      home: { "1h": 45, "1h30": 65, "2h": 90 },
      online: { "1h": 40, "1h30": 55, "2h": 70 }, // Même tarif que "teacher"
    },
  };

  return pricing[grade][location][duration];
}

export interface PackagePrice {
  duration: "1h" | "1h30" | "2h";
  sessionsPerWeek: 1 | 2;
  originalPrice: number;
  packagePrice: number;
  savings: number;
}

export function getPackagePrices(
  grade: "primaire" | "secondaire",
  location: "teacher" | "home" | "online"
): PackagePrice[] {
  const packages = {
    primaire: {
      teacher: [
        { duration: "1h" as const, sessionsPerWeek: 1 as const, packagePrice: 120 },
        { duration: "1h30" as const, sessionsPerWeek: 1 as const, packagePrice: 175 },
        { duration: "2h" as const, sessionsPerWeek: 1 as const, packagePrice: 220 },
        { duration: "1h" as const, sessionsPerWeek: 2 as const, packagePrice: 230 },
        { duration: "1h30" as const, sessionsPerWeek: 2 as const, packagePrice: 340 },
        { duration: "2h" as const, sessionsPerWeek: 2 as const, packagePrice: 440 },
      ],
      home: [
        { duration: "1h" as const, sessionsPerWeek: 1 as const, packagePrice: 145 },
        { duration: "1h30" as const, sessionsPerWeek: 1 as const, packagePrice: 210 },
        { duration: "2h" as const, sessionsPerWeek: 1 as const, packagePrice: 270 },
        { duration: "1h" as const, sessionsPerWeek: 2 as const, packagePrice: 285 },
        { duration: "1h30" as const, sessionsPerWeek: 2 as const, packagePrice: 420 },
        { duration: "2h" as const, sessionsPerWeek: 2 as const, packagePrice: 550 },
      ],
      online: [
        { duration: "1h" as const, sessionsPerWeek: 1 as const, packagePrice: 120 },
        { duration: "1h30" as const, sessionsPerWeek: 1 as const, packagePrice: 175 },
        { duration: "2h" as const, sessionsPerWeek: 1 as const, packagePrice: 220 },
        { duration: "1h" as const, sessionsPerWeek: 2 as const, packagePrice: 230 },
        { duration: "1h30" as const, sessionsPerWeek: 2 as const, packagePrice: 340 },
        { duration: "2h" as const, sessionsPerWeek: 2 as const, packagePrice: 440 },
      ],
    },
    secondaire: {
      teacher: [
        { duration: "1h" as const, sessionsPerWeek: 1 as const, packagePrice: 140 },
        { duration: "1h30" as const, sessionsPerWeek: 1 as const, packagePrice: 190 },
        { duration: "2h" as const, sessionsPerWeek: 1 as const, packagePrice: 240 },
        { duration: "1h" as const, sessionsPerWeek: 2 as const, packagePrice: 270 },
        { duration: "1h30" as const, sessionsPerWeek: 2 as const, packagePrice: 370 },
        { duration: "2h" as const, sessionsPerWeek: 2 as const, packagePrice: 470 },
      ],
      home: [
        { duration: "1h" as const, sessionsPerWeek: 1 as const, packagePrice: 165 },
        { duration: "1h30" as const, sessionsPerWeek: 1 as const, packagePrice: 230 },
        { duration: "2h" as const, sessionsPerWeek: 1 as const, packagePrice: 310 },
        { duration: "1h" as const, sessionsPerWeek: 2 as const, packagePrice: 320 },
        { duration: "1h30" as const, sessionsPerWeek: 2 as const, packagePrice: 450 },
        { duration: "2h" as const, sessionsPerWeek: 2 as const, packagePrice: 610 },
      ],
      online: [
        { duration: "1h" as const, sessionsPerWeek: 1 as const, packagePrice: 140 },
        { duration: "1h30" as const, sessionsPerWeek: 1 as const, packagePrice: 190 },
        { duration: "2h" as const, sessionsPerWeek: 1 as const, packagePrice: 240 },
        { duration: "1h" as const, sessionsPerWeek: 2 as const, packagePrice: 270 },
        { duration: "1h30" as const, sessionsPerWeek: 2 as const, packagePrice: 370 },
        { duration: "2h" as const, sessionsPerWeek: 2 as const, packagePrice: 470 },
      ],
    },
  };

  const selectedPackages = packages[grade][location];

  return selectedPackages.map((pkg) => {
    const sessionsPerMonth = pkg.sessionsPerWeek * 4;
    const singleSessionPrice = calculatePrice({
      grade,
      duration: pkg.duration,
      location,
    });
    const originalPrice = singleSessionPrice * sessionsPerMonth;
    const savings = originalPrice - pkg.packagePrice;

    return {
      ...pkg,
      originalPrice,
      savings,
    };
  });
}
