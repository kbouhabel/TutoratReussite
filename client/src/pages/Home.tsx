import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, DollarSign, GraduationCap, Users, Award } from "lucide-react";

export default function Home() {
  const benefits = [
    {
      icon: BookOpen,
      title: "Apprentissage personnalisé",
      description: "Des cours adaptés aux besoins spécifiques de chaque élève pour une progression optimale.",
    },
    {
      icon: Calendar,
      title: "Horaires flexibles",
      description: "Réservez vos cours selon votre emploi du temps, en ligne ou à domicile.",
    },
    {
      icon: DollarSign,
      title: "Tarifs abordables",
      description: "Des prix compétitifs avec des forfaits mensuels avantageux pour tous les budgets.",
    },
  ];

  const stats = [
    { icon: GraduationCap, value: "5+", label: "Années d'expérience" },
    { icon: Users, value: "100+", label: "Élèves aidés" },
    { icon: Award, value: "3+", label: "Matiéres enseignées" },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-secondary text-secondary-foreground" data-testid="badge-featured">
            Votre partenaire pour la réussite scolaire
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            Donnez à votre enfant les clés de la{" "}
            <span className="text-primary">réussite</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cours particuliers de qualité pour élèves du primaire et secondaire au Québec. 
            Professeurs qualifiés, horaires flexibles, résultats garantis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservation">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8"
                data-testid="button-book-hero"
              >
                Réserver un cours
              </Button>
            </Link>
            <Link href="/forfaits">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                data-testid="button-packages-hero"
              >
                Voir les forfaits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pourquoi choisir TutoratRéussite ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="hover-elevate" data-testid={`card-benefit-${index}`}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Notre expérience en chiffres
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center" data-testid={`stat-${index}`}>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Réservez votre premier cours dès aujourd'hui et découvrez la différence TutoratRéussite.
          </p>
          <Link href="/reservation">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8"
              data-testid="button-book-cta"
            >
              Réserver maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
