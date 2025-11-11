import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      content: "123 Rue de l'Éducation\nMontréal, QC H2X 1Y1",
      link: null,
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "(514) 555-0123",
      link: "tel:5145550123",
    },
    {
      icon: Mail,
      title: "Courriel",
      content: "info@tutoratreussite.ca",
      link: "mailto:info@tutoratreussite.ca",
    },
    {
      icon: Clock,
      title: "Horaires",
      content: "Lundi - Vendredi: 9h - 20h\nSamedi: 9h - 17h\nDimanche: Sur rendez-vous",
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-accent/30 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nous contacter</h1>
          <p className="text-lg text-muted-foreground">
            N'hésitez pas à nous joindre pour toute question
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card key={index} className="hover-elevate" data-testid={`contact-card-${index}`}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-muted-foreground hover:text-primary transition-colors whitespace-pre-line"
                      data-testid={`link-${info.title.toLowerCase()}`}
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-line">
                      {info.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Zone de service</CardTitle>
            <CardDescription>
              Nous offrons nos services dans la région du Grand Montréal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-accent/50 rounded-lg p-8 text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Grand Montréal</h3>
              <p className="text-muted-foreground">
                Nos professeurs se déplacent dans tous les arrondissements de Montréal
                ainsi que les villes environnantes (Laval, Longueuil, Brossard, et plus).
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Questions fréquentes</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                  <div>
                    <h4 className="font-semibold mb-2">Quelle est votre politique d'annulation ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Les cours peuvent être annulés ou reportés jusqu'à 24 heures avant le début
                      sans frais.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Proposez-vous des cours en ligne ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Oui, nous offrons également des cours en ligne via visioconférence pour
                      plus de flexibilité.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Vos professeurs sont-ils qualifiés ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Tous nos tuteurs sont certifiés et possèdent une expérience pédagogique
                      vérifiée.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Puis-je essayer avant de m'abonner ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Absolument ! Vous pouvez réserver un premier cours à l'unité avant de
                      choisir un forfait.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
