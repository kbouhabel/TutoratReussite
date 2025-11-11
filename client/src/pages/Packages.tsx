import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Info } from "lucide-react";
import { getPackagePrices } from "@/lib/pricing";

export default function Packages() {
  const [selectedGrade, setSelectedGrade] = useState<"primaire" | "secondaire">("primaire");
  const [selectedLocation, setSelectedLocation] = useState<"teacher" | "home">("teacher");

  const packages = getPackagePrices(selectedGrade, selectedLocation);
  const oneSessionPackages = packages.filter((pkg) => pkg.sessionsPerWeek === 1);
  const twoSessionPackages = packages.filter((pkg) => pkg.sessionsPerWeek === 2);

  return (
    <div className="min-h-screen bg-accent/30 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Forfaits mensuels</h1>
          <p className="text-lg text-muted-foreground">
            Économisez avec nos forfaits mensuels avantageux
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <Alert className="bg-secondary/10 border-secondary/20">
            <Info className="h-4 w-4 text-secondary" />
            <AlertDescription className="text-secondary-foreground">
              <strong>-15% de rabais</strong> si deux enfants de la même famille s'inscrivent
            </AlertDescription>
          </Alert>
          <Alert className="bg-primary/10 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary-foreground">
              <strong>30$ de rabais</strong> pour les abonnements trimestriels (3 mois)
            </AlertDescription>
          </Alert>
        </div>

        <Tabs value={selectedGrade} onValueChange={(v) => setSelectedGrade(v as "primaire" | "secondaire")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="primaire" data-testid="tab-primaire">Primaire (1 à 6)</TabsTrigger>
            <TabsTrigger value="secondaire" data-testid="tab-secondaire">Secondaire (1 à 5)</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={selectedLocation} onValueChange={(v) => setSelectedLocation(v as "teacher" | "home")} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teacher" data-testid="tab-teacher">Chez le professeur</TabsTrigger>
            <TabsTrigger value="home" data-testid="tab-home">À domicile</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>1 séance / semaine</span>
                <Badge variant="outline" className="text-xs">4 cours/mois</Badge>
              </CardTitle>
              <CardDescription>
                Idéal pour un soutien régulier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {oneSessionPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover-elevate"
                  data-testid={`package-1session-${pkg.duration}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Cours de {pkg.duration}</div>
                    <div className="text-sm text-muted-foreground line-through">
                      {pkg.originalPrice} $
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {pkg.packagePrice} $
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      Économie de {pkg.savings}$
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>2 séances / semaine</span>
                <Badge variant="outline" className="text-xs">8 cours/mois</Badge>
              </CardTitle>
              <CardDescription>
                Pour une progression rapide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoSessionPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover-elevate"
                  data-testid={`package-2sessions-${pkg.duration}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Cours de {pkg.duration}</div>
                    <div className="text-sm text-muted-foreground line-through">
                      {pkg.originalPrice} $
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {pkg.packagePrice} $
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      Économie de {pkg.savings}$
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold">Avantages des forfaits mensuels</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Économies garanties</div>
                    <div className="text-sm text-muted-foreground">
                      Jusqu'à 20% d'économie par rapport aux cours à l'unité
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Flexibilité totale</div>
                    <div className="text-sm text-muted-foreground">
                      Planifiez vos cours selon vos disponibilités
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">Résultats optimaux</div>
                    <div className="text-sm text-muted-foreground">
                      Suivi régulier pour une progression constante
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/reservation">
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  data-testid="button-book-package"
                >
                  Choisir ce forfait
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Besoin d'aide pour choisir ?</h3>
          <p className="text-muted-foreground mb-6">
            Contactez-nous pour discuter de vos besoins et trouver le forfait idéal
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg" data-testid="button-contact">
              Nous contacter
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
